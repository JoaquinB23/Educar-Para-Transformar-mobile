import type { FichaMedicaRespuesta } from '../types';

const mensajeSinFicha = 'El alumno todavía no tiene ficha médica cargada';

export function crearFichaMedicaMock(alumnoId: string): FichaMedicaRespuesta {
  const alumno = {
    id: alumnoId,
    legajo: `LEG-${alumnoId}`,
    nombre: alumnoId === 'mock-hijo-1' ? 'Lucía' : `Alumno ${alumnoId}`,
    apellido: 'De prueba',
    estado: 'activo',
  };

  if (alumnoId === 'mock-hijo-2') {
    return { alumno, ficha: null, mensaje: mensajeSinFicha };
  }

  return {
    alumno,
    ficha: {
      id: alumnoId,
      alumnoId,
      grupoSanguineo: 'O+',
      alergias: ['Polen'],
      condiciones: ['Asma'],
      medicacion: 'Inhalador autorizado',
      contactoEmergencia: {
        nombre: 'Andrea De prueba',
        telefono: '11-5555-0101',
      },
      observaciones: 'Avisar ante síntomas respiratorios.',
      actualizadoEn: '2025-03-10T12:00:00.000Z',
      creadoEn: '2025-03-01T10:00:00.000Z',
      atenciones: [
        {
          id: `${alumnoId}-atencion-1`,
          fecha: '2025-03-10',
          motivo: 'Malestar',
          diagnostico: 'Dolor de cabeza',
          tratamiento: 'Reposo e hidratación',
          registradoPor: 'Sofía Gómez',
          registradoPorRol: 'docente',
          registradaEn: '2025-03-10T12:00:00.000Z',
        },
        {
          id: `${alumnoId}-atencion-2`,
          fecha: '2025-02-14',
          motivo: 'Golpe leve',
          tratamiento: 'Aplicación de frío local',
          observaciones: 'Se retiró sin molestias.',
          registradoPor: 'Enfermería',
          registradaEn: '2025-02-14T10:30:00.000Z',
        },
      ],
    },
  };
}
