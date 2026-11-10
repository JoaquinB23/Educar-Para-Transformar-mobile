#requires -Version 5.1
<#
  scripts\emulador.ps1
  Abre el emulador Android "EducarPixel" y arranca Metro con un solo comando.

  Uso normal (emulador + Metro):
    powershell -ExecutionPolicy Bypass -File .\scripts\emulador.ps1

  Reinicio en frio (si se traba):
    powershell -ExecutionPolicy Bypass -File .\scripts\emulador.ps1 -Reiniciar

  Cerrar el emulador:
    powershell -ExecutionPolicy Bypass -File .\scripts\emulador.ps1 -Cerrar

  Otras opciones:
    -SinMetro      Solo abre el emulador.
    -BorrarDatos   Borra los datos del AVD (equivale a estreno total).
    -LimpiarCache  Arranca Metro con --clear.
    -AbrirApp      Pide a Expo que abra la app en el emulador (--android).
    -TimeoutSegundos  Limite de espera del boot (por defecto 180).
#>
[CmdletBinding()]
param(
  [string]$Avd = 'EducarPixel',
  [switch]$Reiniciar,
  [switch]$Cerrar,
  [switch]$SinMetro,
  [switch]$BorrarDatos,
  [switch]$LimpiarCache,
  [switch]$AbrirApp,
  [int]$TimeoutSegundos = 180
)

$ErrorActionPreference = 'Stop'

$sdk = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { 'D:\Android' }
$emulatorExe = Join-Path $sdk 'emulator\emulator.exe'
$adbExe = Join-Path $sdk 'platform-tools\adb.exe'
$repoRoot = Split-Path -Parent $PSScriptRoot

function Assert-Herramientas {
  foreach ($ruta in @($emulatorExe, $adbExe)) {
    if (-not (Test-Path $ruta)) {
      throw "No se encontro la herramienta: $ruta"
    }
  }
}

function Invoke-Adb {
  param([string[]]$Argumentos)

  $anterior = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    & $adbExe @Argumentos 2>$null
  } finally {
    $ErrorActionPreference = $anterior
  }
}

function Start-AdbServer {
  # Se lanza sin -Wait y con las salidas redirigidas: el daemon de adb no debe
  # heredar la consola/pipeline del script ni bloquear su salida.
  if (Test-Puerto -Puerto 5037) { return }

  $logDir = Join-Path $env:TEMP 'educar-emulador'
  New-Item -ItemType Directory -Force -Path $logDir | Out-Null
  $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  $logOut = Join-Path $logDir "adb-$stamp.out.log"
  $logErr = Join-Path $logDir "adb-$stamp.err.log"
  Start-Process -FilePath $adbExe -ArgumentList 'start-server' `
    -RedirectStandardOutput $logOut -RedirectStandardError $logErr | Out-Null

  $limite = (Get-Date).AddSeconds(15)
  while (-not (Test-Puerto -Puerto 5037) -and (Get-Date) -lt $limite) {
    Start-Sleep -Milliseconds 300
  }
}

function Get-SerialesEmulador {
  $salida = Invoke-Adb -Argumentos @('devices')
  @($salida | ForEach-Object {
      if ($_ -match '^(emulator-\d+)\s+device') { $matches[1] }
    })
}

function Stop-Emuladores {
  Write-Host 'Cerrando emuladores...' -ForegroundColor Yellow
  Invoke-Adb -Argumentos @('emu','kill') | Out-Null
  Start-Sleep -Seconds 1

  Get-Process -Name 'emulator', 'qemu-system-x86_64', 'qemu-system-i386' -ErrorAction SilentlyContinue |
    Stop-Process -Force -ErrorAction SilentlyContinue
  Start-Sleep -Seconds 1

  Invoke-Adb -Argumentos @('kill-server') | Out-Null
  Write-Host 'Emulador cerrado.' -ForegroundColor Green
}

function Start-Emulador {
  $serialesAntes = @(Get-SerialesEmulador)
  if ($serialesAntes.Count -gt 0 -and -not $Reiniciar) {
    Write-Host "Ya hay un emulador corriendo: $($serialesAntes[0])" -ForegroundColor Cyan
    return $serialesAntes[0]
  }

  $argumentos = @('-avd', $Avd)
  if ($Reiniciar -or $BorrarDatos) { $argumentos += '-no-snapshot-load' }
  if ($BorrarDatos) { $argumentos += '-wipe-data' }

  Write-Host "Iniciando $Avd..." -ForegroundColor Cyan
  $logDir = Join-Path $env:TEMP 'educar-emulador'
  New-Item -ItemType Directory -Force -Path $logDir | Out-Null
  $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  $logOut = Join-Path $logDir "emulator-$stamp.out.log"
  $logErr = Join-Path $logDir "emulator-$stamp.err.log"
  Start-Process -FilePath $emulatorExe -ArgumentList $argumentos `
    -RedirectStandardOutput $logOut -RedirectStandardError $logErr | Out-Null

  $limite = (Get-Date).AddSeconds($TimeoutSegundos)
  $serial = $null

  while ((Get-Date) -lt $limite) {
    Start-Sleep -Seconds 2
    $seriales = @(Get-SerialesEmulador)
    if ($seriales.Count -gt 0) {
      $serial = $seriales | Where-Object { $serialesAntes -notcontains $_ } | Select-Object -First 1
      if (-not $serial) { $serial = $seriales[0] }
      break
    }
  }

  if (-not $serial) {
    throw "El emulador no arranco en $TimeoutSegundos segundos."
  }

  Write-Host "Esperando el boot de $serial..." -ForegroundColor Cyan
  while ((Get-Date) -lt $limite) {
    $boot = (Invoke-Adb -Argumentos @('-s', $serial, 'shell', 'getprop', 'sys.boot_completed')) -join ''
    if ($boot.Trim() -eq '1') {
      Write-Host "Emulador listo: $serial" -ForegroundColor Green
      return $serial
    }
    Start-Sleep -Seconds 2
  }

  throw "El emulador $serial no termino de bootear en $TimeoutSegundos segundos."
}

function Test-Puerto {
  param([int]$Puerto)

  $cliente = New-Object System.Net.Sockets.TcpClient
  try {
    $async = $cliente.BeginConnect('127.0.0.1', $Puerto, $null, $null)
    $ok = $async.AsyncWaitHandle.WaitOne(400)
    if ($ok) { $cliente.EndConnect($async) }
    return $ok
  } catch {
    return $false
  } finally {
    $cliente.Close()
  }
}

function Start-Metro {
  if (Test-Puerto -Puerto 8081) {
    Write-Host 'Metro ya esta corriendo en http://localhost:8081' -ForegroundColor Yellow
    return
  }

  $expo = Join-Path $repoRoot 'node_modules\.bin\expo.cmd'
  $argumentos = @()

  if (-not (Test-Path $expo)) {
    $expo = 'npx'
    $argumentos += @('expo')
  }

  $argumentos += @('start', '--dev-client')
  if ($LimpiarCache) { $argumentos += '--clear' }
  if ($AbrirApp) { $argumentos += '--android' }

  Write-Host "Arrancando Metro en $repoRoot ..." -ForegroundColor Cyan
  Push-Location $repoRoot
  $anterior = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    & $expo @argumentos
  } finally {
    $ErrorActionPreference = $anterior
    Pop-Location
  }
}

Assert-Herramientas
Start-AdbServer

if ($Cerrar) {
  Stop-Emuladores
  return
}

if ($Reiniciar -or $BorrarDatos) {
  Stop-Emuladores
  Start-AdbServer
}

$serial = Start-Emulador

if ($SinMetro) {
  Write-Host "Emulador listo. Metro no se inicio (-SinMetro)." -ForegroundColor Yellow
} else {
  Start-Metro
}

