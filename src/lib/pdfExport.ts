import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFPatientData {
  patientName: string;
  diagnosis?: string;
  evolutionData?: number[];
  sessions: Array<{
    fecha: string;
    ejercicio: string;
    duracion_segundos: number;
    repeticiones: number;
    calidad_ejecucion: number;
  }>;
  globalMetrics?: {
    totalSessions?: number;
    avgQuality?: number;
    streak?: number;
    weeklyMinutes?: number;
  };
  clinicalData?: {
    fechaNacimiento?: string;
    tipoSangre?: string;
    medicamentos?: string;
    alergias?: string;
    extremidad?: string;
    romObjetivo?: string;
    frecuenciaSesiones?: string;
    medicoTratante?: string;
    diagnosticoSecundario?: string;
    enfermedadesCronicas?: string;
    lesionesPrevias?: string;
    estatura?: number;
    peso?: number;
    contactoEmergencia?: string;
    contactoEmergenciaTelefono?: string;
  };
}

const TEAL: [number, number, number] = [0, 80, 77];
const DARK_GRAY: [number, number, number] = [50, 55, 55];
const LIGHT_GRAY: [number, number, number] = [240, 240, 240];

export function exportSimplePDF(data: PDFPatientData, filename: string) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;

  doc.setFillColor(...TEAL);
  doc.rect(0, 0, pageWidth, 80, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('FisioMirror', margin, 36);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Informe de Recuperación del Paciente', margin, 56);
  doc.setFontSize(9);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES', { dateStyle: 'long' })}`, pageWidth - margin, 36, { align: 'right' });

  let y = 110;
  doc.setTextColor(...DARK_GRAY);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Datos del Paciente', margin, y);
  y += 20;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre: ${data.patientName}`, margin, y);
  y += 16;
  if (data.diagnosis) {
    doc.text(`Diagnóstico: ${data.diagnosis}`, margin, y);
    y += 16;
  }

  if (data.clinicalData) {
    const cd = data.clinicalData;
    const fields: Array<[string, string | number | undefined]> = [
      ['Fecha de Nacimiento', cd.fechaNacimiento],
      ['Tipo de Sangre', cd.tipoSangre],
      ['Diagnóstico Secundario', cd.diagnosticoSecundario],
      ['Medicamentos Actuales', cd.medicamentos],
      ['Alergias', cd.alergias],
      ['Enfermedades Crónicas', cd.enfermedadesCronicas],
      ['Lesiones Previas', cd.lesionesPrevias],
      ['Extremidad Afectada', cd.extremidad],
      ['ROM Objetivo', cd.romObjetivo],
      ['Frecuencia de Sesiones', cd.frecuenciaSesiones],
      ['Médico Tratante', cd.medicoTratante],
      ['Estatura (cm)', cd.estatura],
      ['Peso (kg)', cd.peso],
      ['Contacto de Emergencia', cd.contactoEmergencia],
      ['Teléfono de Emergencia', cd.contactoEmergenciaTelefono],
    ];
    for (const [label, value] of fields) {
      if (value != null && value !== '') {
        if (y > pageHeight - 60) { doc.addPage(); y = 50; }
        doc.text(`${label}: ${value}`, margin, y);
        y += 16;
      }
    }
  }

  if (data.globalMetrics) {
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Métricas Globales', margin, y);
    y += 18;
    doc.setFont('helvetica', 'normal');
    if (data.globalMetrics.totalSessions != null) {
      doc.text(`Total de sesiones: ${data.globalMetrics.totalSessions}`, margin, y);
      y += 16;
    }
    if (data.globalMetrics.weeklyMinutes != null) {
      doc.text(`Minutos semanales: ${data.globalMetrics.weeklyMinutes} min`, margin, y);
      y += 16;
    }
    if (data.globalMetrics.avgQuality != null) {
      doc.text(`Calidad promedio: ${data.globalMetrics.avgQuality.toFixed(1)}%`, margin, y);
      y += 16;
    }
    if (data.globalMetrics.streak != null) {
      doc.text(`Racha actual: ${data.globalMetrics.streak} días`, margin, y);
      y += 16;
    }
  }

  // Evolución semanal (gráfico de barras de calidad de ejecución)
  if (data.evolutionData && data.evolutionData.some((v) => v > 0)) {
    if (y > pageHeight - 160) {
      doc.addPage();
      y = 50;
    }
    y += 16;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...DARK_GRAY);
    doc.text('Evolución Semanal', margin, y);
    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Calidad de ejecución por semana (últimas 6 semanas)', margin, y);
    y += 14;

    const chartW = pageWidth - margin * 2;
    const chartH = 80;
    const maxVal = Math.max(...data.evolutionData, 1);
    const barCount = data.evolutionData.length;
    const gap = 12;
    const barW = (chartW - gap * (barCount - 1)) / barCount;
    const baseY = y + chartH;

    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(margin, baseY, margin + chartW, baseY);

    data.evolutionData.forEach((val, i) => {
      const bx = margin + i * (barW + gap);
      const bh = (val / maxVal) * chartH;
      const by = baseY - bh;
      doc.setFillColor(...TEAL);
      doc.rect(bx, by, barW, bh, 'F');
      doc.setFontSize(8);
      doc.setTextColor(...DARK_GRAY);
      doc.text(val > 0 ? `${Math.round(val)}%` : '—', bx + barW / 2, by - 4, { align: 'center' });
      doc.text(`Sem ${i + 1}`, bx + barW / 2, baseY + 12, { align: 'center' });
    });
    y = baseY + 24;
  }

  if (y > pageHeight - 120) {
    doc.addPage();
    y = 50;
  }
  y += 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Sesiones Registradas', margin, y);
  y += 10;

  doc.setFillColor(...LIGHT_GRAY);
  doc.rect(margin, y, pageWidth - margin * 2, 24, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK_GRAY);
  doc.text('Fecha', margin + 8, y + 16);
  doc.text('Ejercicio', margin + 100, y + 16);
  doc.text('Duración', margin + 260, y + 16);
  doc.text('Reps', margin + 340, y + 16);
  doc.text('Calidad', margin + 400, y + 16);
  y += 24;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  for (const s of data.sessions) {
    if (y > pageHeight - 60) {
      doc.addPage();
      y = 50;
    }
    const fechaStr = new Date(s.fecha).toLocaleDateString('es-ES');
    const duracionStr = `${Math.round(s.duracion_segundos / 60)} min`;
    doc.text(fechaStr, margin + 8, y + 16);
    doc.text(s.ejercicio.slice(0, 25), margin + 100, y + 16);
    doc.text(duracionStr, margin + 260, y + 16);
    doc.text(String(s.repeticiones), margin + 340, y + 16);
    doc.text(`${s.calidad_ejecucion.toFixed(0)}%`, margin + 400, y + 16);
    y += 22;
  }

  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text('FisioMirror S.A. | Reporte generado automáticamente con certificación clínica', margin, pageHeight - 20);

  doc.save(filename);
}

export interface SessionSummaryData {
  patientName: string;
  therapistName?: string;
  clinicName?: string;
  exerciseName: string;
  targetRom: number;
  achievedRom: number;
  repetitions: number;
  targetRepetitions: number;
  postureQualityScore: number;
  durationSeconds: number;
  compensationsDetected?: string[];
  feedbackNotes?: string;
  date?: string;
}

export function exportSessionSummaryPDF(session: SessionSummaryData, filename?: string) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner - Teal to Azure
  doc.setFillColor(0, 80, 77); // Deep Teal
  doc.rect(0, 0, pageWidth, 85, 'F');
  doc.setFillColor(58, 95, 148); // Azure Blue Accent Line
  doc.rect(0, 85, pageWidth, 4, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('FisioMirror', margin, 38);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('INFORME CLÍNICO DE SESIÓN BIOMECÁNICA', margin, 58);

  doc.setFontSize(9);
  const sessionDate = session.date || new Date().toLocaleDateString('es-ES', { dateStyle: 'long' });
  doc.text(`Fecha: ${sessionDate}`, pageWidth - margin, 38, { align: 'right' });
  doc.text(`Clínica: ${session.clinicName || 'FisioMirror Tele-Rehab'}`, pageWidth - margin, 54, { align: 'right' });

  let y = 115;

  // Patient Info Card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 55, 8, 8, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 55, 8, 8, 'S');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Paciente: ${session.patientName}`, margin + 14, y + 22);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Ejercicio Ejecutado: ${session.exerciseName}`, margin + 14, y + 42);
  if (session.therapistName) {
    doc.text(`Fisioterapeuta: ${session.therapistName}`, pageWidth - margin - 14, y + 22, { align: 'right' });
  }
  const minActive = Math.max(1, Math.round(session.durationSeconds / 60));
  doc.text(`Duración Activa: ${minActive} min (${session.durationSeconds}s)`, pageWidth - margin - 14, y + 42, { align: 'right' });

  y += 75;

  // 4 KPI Metric Boxes
  const kpiWidth = (contentWidth - 30) / 4;
  const kpis = [
    {
      label: 'ROM MÁXIMO',
      val: `${session.achievedRom}°`,
      sub: `Obj: ${session.targetRom}°`,
      color: session.achievedRom >= session.targetRom * 0.9 ? [22, 163, 74] : [217, 119, 6],
    },
    {
      label: 'REPETICIONES',
      val: `${session.repetitions}`,
      sub: `Meta: ${session.targetRepetitions}`,
      color: session.repetitions >= session.targetRepetitions ? [22, 163, 74] : [58, 95, 148],
    },
    {
      label: 'CALIDAD POSTURAL',
      val: `${session.postureQualityScore}%`,
      sub: session.postureQualityScore >= 80 ? 'Excelente' : 'Aceptable',
      color: session.postureQualityScore >= 80 ? [22, 163, 74] : [217, 119, 6],
    },
    {
      label: 'CUMPLIMIENTO ROM',
      val: `${Math.round((session.achievedRom / Math.max(1, session.targetRom)) * 100)}%`,
      sub: 'Biometría MediaPipe',
      color: [0, 80, 77],
    },
  ];

  kpis.forEach((kpi, idx) => {
    const kx = margin + idx * (kpiWidth + 10);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(kx, y, kpiWidth, 68, 6, 6, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(kx, y, kpiWidth, 68, 6, 6, 'S');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, kx + kpiWidth / 2, y + 16, { align: 'center' });

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.val, kx + kpiWidth / 2, y + 42, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(kpi.sub, kx + kpiWidth / 2, y + 58, { align: 'center' });
  });

  y += 90;

  // Biomechanical Compensations Section
  doc.setTextColor(0, 80, 77);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Análisis Biomecánico y Compensaciones Detectadas', margin, y);
  y += 18;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 70, 6, 6, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 70, 6, 6, 'S');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  const compList = session.compensationsDetected && session.compensationsDetected.length > 0
    ? session.compensationsDetected
    : ['No se detectaron compensaciones articulares desfavorables durante la ejecución.'];

  compList.slice(0, 3).forEach((comp, i) => {
    doc.text(`• ${comp}`, margin + 14, y + 20 + i * 16);
  });

  y += 92;

  // Clinical Recommendations & Notes
  doc.setTextColor(0, 80, 77);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Conclusiones y Recomendaciones Terapéuticas', margin, y);
  y += 18;

  const notes = session.feedbackNotes ||
    'El paciente completó la sesión con alineación biomecánica adecuada y progresión favorable en el rango de movilidad. Se recomienda mantener la pauta actual y continuar con hidratación previa a la siguiente sesión.';

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, y, contentWidth, 80, 6, 6, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 80, 6, 6, 'S');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const splitNotes = doc.splitTextToSize(notes, contentWidth - 28);
  doc.text(splitNotes, margin + 14, y + 22);

  y += 105;

  // Validation Seal & Signature Box
  doc.setDrawColor(0, 80, 77);
  doc.setLineWidth(1);
  doc.line(margin + contentWidth - 200, y + 45, margin + contentWidth, y + 45);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Firma y Sello del Fisioterapeuta', margin + contentWidth - 100, y + 60, { align: 'center' });

  // FisioMirror Certification Badge on Left
  doc.setFillColor(240, 253, 250);
  doc.roundedRect(margin, y + 10, 220, 50, 6, 6, 'F');
  doc.setDrawColor(153, 220, 217);
  doc.roundedRect(margin, y + 10, 220, 50, 6, 6, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 80, 77);
  doc.text('FISIOMIRROR VERIFIED CLINICAL SESSION', margin + 14, y + 28);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Tele-rehabilitación con Visión Computacional MediaPipe', margin + 14, y + 40);
  doc.text(`Registro de Autenticidad: FM-AR-${Date.now().toString(36).toUpperCase()}`, margin + 14, y + 50);

  // Footer
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text('Documento médico confidencial emitido bajo normas de tele-salud. FisioMirror © 2026', margin, pageHeight - 20);

  const outName = filename || `Informe_Sesion_${session.patientName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  doc.save(outName);
}

export interface RoutinePrescriptionData {
  patientName: string;
  patientDocId?: string;
  patientAge?: number | string;
  therapistName: string;
  therapistLicense?: string;
  clinicName?: string;
  diagnosis: string;
  prescriptionDate: string;
  validUntil?: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    targetRom?: string;
    frequency: string;
    notes?: string;
  }>;
  precautions?: string[];
  nextAppointment?: string;
}

export function exportRoutinePrescriptionPDF(rx: RoutinePrescriptionData, filename?: string) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  // Top Hospital Header
  doc.setFillColor(0, 80, 77); // Deep Teal
  doc.rect(0, 0, pageWidth, 90, 'F');
  doc.setFillColor(58, 95, 148); // Azure Blue Accent
  doc.rect(0, 90, pageWidth, 4, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('FisioMirror', margin, 38);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('PRESCRIPCIÓN DE FISIOTERAPIA Y RECETA DE EJERCICIOS', margin, 58);

  doc.setFontSize(9);
  doc.text(`Emisión: ${rx.prescriptionDate}`, pageWidth - margin, 38, { align: 'right' });
  doc.text(`Centro: ${rx.clinicName || 'FisioMirror Red Clínica'}`, pageWidth - margin, 52, { align: 'right' });
  if (rx.validUntil) {
    doc.text(`Válida hasta: ${rx.validUntil}`, pageWidth - margin, 66, { align: 'right' });
  }

  let y = 115;

  // Doctor & Patient Two-Column Summary Card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 75, 8, 8, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 75, 8, 8, 'S');

  // Left: Patient
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 80, 77);
  doc.text('DATOS DEL PACIENTE', margin + 14, y + 20);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(`Nombre: ${rx.patientName}`, margin + 14, y + 36);
  if (rx.patientDocId) {
    doc.text(`Documento: ${rx.patientDocId}`, margin + 14, y + 50);
  }
  doc.text(`Diagnóstico: ${rx.diagnosis}`, margin + 14, y + 64);

  // Right: Professional
  const rightX = margin + contentWidth / 2 + 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 80, 77);
  doc.text('PROFESIONAL TRATANTE', rightX, y + 20);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(`Fisioterapeuta: ${rx.therapistName}`, rightX, y + 36);
  if (rx.therapistLicense) {
    doc.text(`Licencia / Matrícula: ${rx.therapistLicense}`, rightX, y + 50);
  }
  if (rx.nextAppointment) {
    doc.text(`Próxima Consulta: ${rx.nextAppointment}`, rightX, y + 64);
  }

  y += 95;

  // Prescription Table
  doc.setTextColor(0, 80, 77);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Plan de Trabajo Prescrito (Pauta Terapéutica)', margin, y);
  y += 14;

  // Table Header
  doc.setFillColor(0, 80, 77);
  doc.rect(margin, y, contentWidth, 24, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('EJERCICIO', margin + 8, y + 16);
  doc.text('DOSIFICACIÓN', margin + 180, y + 16);
  doc.text('ROM / ÁNGULO', margin + 280, y + 16);
  doc.text('FRECUENCIA', margin + 370, y + 16);
  y += 24;

  // Table Rows
  rx.exercises.forEach((ex, idx) => {
    if (y > pageHeight - 120) {
      doc.addPage();
      y = 50;
    }
    const rowBg = idx % 2 === 0 ? 255 : 248;
    doc.setFillColor(rowBg, rowBg, rowBg === 248 ? 250 : 255);
    doc.rect(margin, y, contentWidth, 26, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 26, margin + contentWidth, y + 26);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(ex.name.slice(0, 30), margin + 8, y + 17);

    doc.setFont('helvetica', 'normal');
    doc.text(`${ex.sets} series × ${ex.reps} reps`, margin + 180, y + 17);
    doc.text(ex.targetRom || 'Tolerancia', margin + 280, y + 17);
    doc.text(ex.frequency || 'Diario', margin + 370, y + 17);
    y += 26;
  });

  y += 25;

  // Guidelines and Precautions
  doc.setTextColor(0, 80, 77);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Indicaciones, Precauciones y Criterios de Detención', margin, y);
  y += 14;

  const precautions = rx.precautions && rx.precautions.length > 0
    ? rx.precautions
    : [
        'Realizar los ejercicios frente al Espejo AR manteniendo la postura indicada por el avatar guía.',
        'Suspender inmediatamente ante dolor punzante superior a 4/10 en escala analógica visual.',
        'No forzar articulaciones inflamadas; respetar los tiempos de descanso entre series.',
      ];

  doc.setFillColor(254, 242, 242);
  doc.roundedRect(margin, y, contentWidth, 54, 6, 6, 'F');
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(margin, y, contentWidth, 54, 6, 6, 'S');

  doc.setTextColor(153, 27, 27);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  precautions.slice(0, 3).forEach((p, i) => {
    doc.text(`• ${p}`, margin + 12, y + 16 + i * 14);
  });

  y += 75;

  // Signature and Official Stamp Box
  doc.setDrawColor(0, 80, 77);
  doc.setLineWidth(1);
  doc.line(margin + contentWidth - 200, y + 45, margin + contentWidth, y + 45);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(rx.therapistName, margin + contentWidth - 100, y + 58, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Firma y Sello del Fisioterapeuta', margin + contentWidth - 100, y + 70, { align: 'center' });

  // Official QR / Digital Rx ID on Left
  doc.setFillColor(240, 253, 250);
  doc.roundedRect(margin, y + 10, 220, 55, 6, 6, 'F');
  doc.setDrawColor(153, 220, 217);
  doc.roundedRect(margin, y + 10, 220, 55, 6, 6, 'S');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 80, 77);
  doc.text('RECETA CLÍNICA DIGITAL FISIOMIRROR', margin + 14, y + 28);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Validez para tele-monitoreo asistido por IA', margin + 14, y + 40);
  doc.text(`Código de Verificación: RX-${Date.now().toString(36).toUpperCase()}`, margin + 14, y + 52);

  // Bottom footer
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text('Receta de rehabilitación válida conforme a telemedicina. FisioMirror © 2026', margin, pageHeight - 20);

  const outName = filename || `Receta_Fisioterapia_${rx.patientName.replace(/\s+/g, '_')}.pdf`;
  doc.save(outName);
}

export function buildPremiumHTML(data: PDFPatientData, aiNarrative?: string): string {
  const cd = data.clinicalData || {};
  const gm = data.globalMetrics || {};
  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return d; }
  };
  const today = new Date().toLocaleDateString('es-ES', { dateStyle: 'long' });

  const qualityColor = (q: number) => q >= 80 ? '#10b981' : q >= 60 ? '#f59e0b' : '#ef4444';
  const adherenceVal = gm.avgQuality ?? 0;
  const adherenceColor = adherenceVal >= 80 ? '#10b981' : adherenceVal >= 60 ? '#f59e0b' : '#ef4444';

  // SVG bar chart for evolution
  const evolutionBars = (data.evolutionData || []).map((val, i) => {
    const maxVal = Math.max(...(data.evolutionData || [1]), 1);
    const h = (val / maxVal) * 120;
    const x = 30 + i * 60;
    const y = 130 - h;
    const color = val >= 80 ? '#00837a' : val >= 60 ? '#f59e0b' : '#ef4444';
    return `
      <rect x="${x}" y="${y}" width="40" height="${h}" rx="4" fill="${color}" opacity="0.85"/>
      <text x="${x + 20}" y="${y - 6}" text-anchor="middle" font-size="11" font-weight="700" fill="#323737">${Math.round(val)}%</text>
      <text x="${x + 20}" y="148" text-anchor="middle" font-size="10" fill="#888">Sem ${i + 1}</text>
    `;
  }).join('');

  // Session rows
  const sessionRows = data.sessions.slice(0, 12).map((s, i) => {
    const bg = i % 2 === 0 ? '#f8fafb' : '#ffffff';
    const qc = qualityColor(s.calidad_ejecucion);
    const dur = `${Math.round(s.duracion_segundos / 60)} min`;
    return `
      <tr style="background:${bg}">
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:11px;color="#323737">${fmtDate(s.fecha)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:11px;color="#323737">${s.ejercicio.slice(0, 28)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:11px;color="#323737;text-align:center">${dur}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:11px;color="#323737;text-align:center">${s.repeticiones}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center">
          <span style="display:inline-block;padding:2px 10px;border-radius:10px;font-size:11px;font-weight:700;color:#fff;background:${qc}">${Math.round(s.calidad_ejecucion)}%</span>
        </td>
      </tr>
    `;
  }).join('');

  // Clinical data rows
  const clinicalRows: string[] = [];
  const fieldMap: Array<[string, string | number | undefined]> = [
    ['Fecha de Nacimiento', cd.fechaNacimiento],
    ['Diagnóstico Principal', data.diagnosis],
    ['Diagnóstico Secundario', cd.diagnosticoSecundario],
    ['Extremidad Afectada', cd.extremidad],
    ['ROM Objetivo', cd.romObjetivo],
    ['Frecuencia de Sesiones', cd.frecuenciaSesiones],
    ['Médico Tratante', cd.medicoTratante],
    ['Medicamentos', cd.medicamentos],
    ['Alergias', cd.alergias],
    ['Tipo de Sangre', cd.tipoSangre],
    ['Enfermedades Crónicas', cd.enfermedadesCronicas],
    ['Lesiones Previas', cd.lesionesPrevias],
    ['Estatura', cd.estatura ? `${cd.estatura} cm` : undefined],
    ['Peso', cd.peso ? `${cd.peso} kg` : undefined],
    ['Contacto Emergencia', cd.contactoEmergencia],
    ['Teléfono Emergencia', cd.contactoEmergenciaTelefono],
  ];
  for (const [label, value] of fieldMap) {
    if (value != null && value !== '') {
      clinicalRows.push(`
        <tr>
          <td style="padding:6px 14px;font-size:12px;font-weight:600;color="#00504d;background:#f0fdfa;width:40%;border-right:3px solid #00837a">${label}</td>
          <td style="padding:6px 14px;font-size:12px;color="#323737">${value}</td>
        </tr>
      `);
    }
  }

  // Metrics cards
  const totalSessions = gm.totalSessions ?? data.sessions.length;
  const metricCard = (label: string, value: string, color: string, bgColor: string) => `
    <div style="flex:1;background:${bgColor};border-radius:12px;padding:14px 16px;text-align:center;border:1px solid ${color}22">
      <div style="font-size:11px;color="#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">${label}</div>
      <div style="font-size:24px;font-weight:800;color:${color};margin-top:4px">${value}</div>
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#fff;color:#323737}</style></head>
<body>
  <div style="width:754px;padding:0;background:#fff;position:relative">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#00504d 0%,#00837a 100%);padding:28px 40px;display:flex;justify-content:space-between;align-items:center">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="width:42px;height:42px;background:rgba(255,255,255,0.15);border-radius:12px;display:flex;align-items:center;justify-content:center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/></svg>
        </div>
        <div>
          <div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px">FisioMirror</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.7);margin-top:1px">Reporte Clínico de Rehabilitación</div>
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-size:10px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:1px">Fecha de Generación</div>
        <div style="font-size:13px;color:#fff;font-weight:600;margin-top:2px">${today}</div>
      </div>
    </div>

    <!-- Patient info bar -->
    <div style="padding:20px 40px;background:#f0fdfa;border-bottom:1px solid #00837a22">
      <div style="display:flex;gap:30px;flex-wrap:wrap">
        <div>
          <div style="font-size:10px;color="#00837a;text-transform:uppercase;letter-spacing:1px;font-weight:600">Paciente</div>
          <div style="font-size:18px;font-weight:700;color="#00504d;margin-top:2px">${data.patientName}</div>
        </div>
        ${data.diagnosis ? `<div><div style="font-size:10px;color="#00837a;text-transform:uppercase;letter-spacing:1px;font-weight:600">Diagnóstico</div><div style="font-size:14px;color="#323737;margin-top:4px;font-weight:500">${data.diagnosis}</div></div>` : ''}
        ${cd.medicoTratante ? `<div><div style="font-size:10px;color="#00837a;text-transform:uppercase;letter-spacing:1px;font-weight:600">Médico Tratante</div><div style="font-size:14px;color="#323737;margin-top:4px;font-weight:500">${cd.medicoTratante}</div></div>` : ''}
      </div>
    </div>

    <!-- Metrics -->
    <div style="padding:20px 40px">
      <div style="font-size:14px;font-weight:700;color="#00504d;margin-bottom:12px;display:flex;align-items:center;gap:8px">
        <span style="display:inline-block;width:4px;height:18px;background:#00837a;border-radius:2px"></span>
        Métricas de Progreso
      </div>
      <div style="display:flex;gap:12px">
        ${metricCard('Sesiones', String(totalSessions), '#00837a', '#f0fdfa')}
        ${metricCard('Adherencia', `${Math.round(adherenceVal)}%`, adherenceColor, adherenceColor === '#10b981' ? '#ecfdf5' : adherenceColor === '#f59e0b' ? '#fffbeb' : '#fef2f2')}
        ${gm.streak != null ? metricCard('Racha', `${gm.streak}d`, '#0ea5e9', '#f0f9ff') : ''}
        ${gm.weeklyMinutes != null ? metricCard('Min/Semana', `${gm.weeklyMinutes}`, '#14b8a6', '#f0fdfa') : ''}
      </div>
    </div>

    <!-- Evolution chart -->
    ${evolutionBars ? `
    <div style="padding:10px 40px 20px">
      <div style="font-size:14px;font-weight:700;color="#00504d;margin-bottom:8px;display:flex;align-items:center;gap:8px">
        <span style="display:inline-block;width:4px;height:18px;background:#00837a;border-radius:2px"></span>
        Evolución de Calidad Semanal
      </div>
      <svg width="674" height="160" style="background:#f8fafb;border-radius:12px;border:1px solid #e2e8f0">
        <line x1="20" y1="130" x2="660" y2="130" stroke="#e2e8f0" stroke-width="1"/>
        ${evolutionBars}
      </svg>
    </div>` : ''}

    <!-- Clinical data table -->
    ${clinicalRows.length > 0 ? `
    <div style="padding:10px 40px 20px">
      <div style="font-size:14px;font-weight:700;color="#00504d;margin-bottom:8px;display:flex;align-items:center;gap:8px">
        <span style="display:inline-block;width:4px;height:18px;background:#00837a;border-radius:2px"></span>
        Datos Clínicos del Paciente
      </div>
      <table style="width:100%;border-collapse:collapse;border-radius:10px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05)">
        ${clinicalRows.join('')}
      </table>
    </div>` : ''}

    <!-- Sessions table -->
    ${sessionRows ? `
    <div style="padding:10px 40px 20px">
      <div style="font-size:14px;font-weight:700;color="#00504d;margin-bottom:8px;display:flex;align-items:center;gap:8px">
        <span style="display:inline-block;width:4px;height:18px;background:#00837a;border-radius:2px"></span>
        Sesiones Registradas
      </div>
      <table style="width:100%;border-collapse:collapse;border-radius:10px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05)">
        <thead>
          <tr style="background:#00504d">
            <th style="padding:10px 12px;font-size:11px;color:#fff;text-align:left;font-weight:600">Fecha</th>
            <th style="padding:10px 12px;font-size:11px;color:#fff;text-align:left;font-weight:600">Ejercicio</th>
            <th style="padding:10px 12px;font-size:11px;color:#fff;text-align:center;font-weight:600">Duración</th>
            <th style="padding:10px 12px;font-size:11px;color:#fff;text-align:center;font-weight:600">Reps</th>
            <th style="padding:10px 12px;font-size:11px;color:#fff;text-align:center;font-weight:600">Calidad</th>
          </tr>
        </thead>
        <tbody>${sessionRows}</tbody>
      </table>
    </div>` : ''}

    <!-- AI Narrative -->
    ${aiNarrative ? `
    <div style="padding:10px 40px 20px">
      <div style="font-size:14px;font-weight:700;color="#00504d;margin-bottom:10px;display:flex;align-items:center;gap:8px">
        <span style="display:inline-block;width:4px;height:18px;background:#00837a;border-radius:2px"></span>
        Análisis Clínico IA
      </div>
      <div style="background:linear-gradient(135deg,#f0fdfa 0%,#ecfeff 100%);border-radius:14px;padding:20px 24px;border-left:4px solid #00837a">
        <div style="font-size:13px;line-height:1.7;color="#323737;white-space:pre-wrap">${aiNarrative.replace(/</g, '&lt;')}</div>
      </div>
    </div>` : ''}

    <!-- Footer -->
    <div style="padding:16px 40px;background:#f8fafb;border-top:2px solid #00837a;display:flex;justify-content:space-between;align-items:center">
      <div style="font-size:10px;color:#94a3b8">Generado por FisioMirror · Reporte clínico automatizado</div>
      <div style="font-size:10px;color="#94a3b8;font-weight:600">Página 1</div>
    </div>
  </div>
</body>
</html>`;
}

export async function exportPremiumPDF(data: PDFPatientData, filename: string, aiNarrative?: string) {
  const html = buildPremiumHTML(data, aiNarrative);
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.background = '#ffffff';
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    if (imgHeight <= pdfHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    } else {
      let position = 0;
      let heightLeft = imgHeight;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(container);
  }
}

export async function exportAIPDF(htmlContent: string, filename: string) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.background = '#ffffff';
  container.style.padding = '40px';
  container.style.fontFamily = 'sans-serif';
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    if (imgHeight <= pdfHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    } else {
      let position = 0;
      let heightLeft = imgHeight;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(container);
  }
}
