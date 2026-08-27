import React, { useEffect, useMemo, useState } from 'react';
import { User, Stethoscope } from 'lucide-react';
import type { ExerciseDefinition, CharacterRole, JointRotationAxis } from '../../types/character.types';
import { KidModel3D } from '../characters3d/KidModel3D';
import { PhysioModel3D } from '../characters3d/PhysioModel3D';

interface SkeletonDemoProps {
  exercise: ExerciseDefinition;
  userRole?: CharacterRole;
}

export const SkeletonDemo: React.FC<SkeletonDemoProps> = ({ exercise, userRole = 'patient' }) => {
  const [progress, setProgress] = useState(0);
  const [selectedRole, setSelectedRole] = useState<CharacterRole>(
    userRole === 'physio' ? 'physio' : 'patient'
  );

  useEffect(() => {
    setProgress(0);
    let direction = 1;
    const interval = window.setInterval(() => {
      setProgress((previous) => {
        const next = previous + direction * 0.025;
        if (next >= 1) {
          direction = -1;
          return 1;
        }
        if (next <= 0) {
          direction = 1;
          return 0;
        }
        return next;
      });
    }, 40);
    return () => window.clearInterval(interval);
  }, [exercise.id]);

  const currentJointAngles: Record<string, number> = {};
  const jointAxes = useMemo<Partial<Record<string, JointRotationAxis>>>(() => {
    return exercise.targetJoints.reduce((axes, joint) => {
      axes[joint.joint] = joint.axis ?? 'x';
      return axes;
    }, {} as Partial<Record<string, JointRotationAxis>>);
  }, [exercise.targetJoints]);
  let overallStatusColor = '#10B981';

  exercise.targetJoints.forEach((j) => {
    const neutral = j.neutralAngle ?? 0;
    const angle = neutral + (j.targetAngle - neutral) * progress;
    currentJointAngles[j.joint] = angle;
    const diff = Math.abs(angle - j.targetAngle);
    const tolerance = j.tolerance ?? 5;
    if (diff > tolerance + 10) {
      overallStatusColor = '#EF4444';
    } else if (diff > tolerance && overallStatusColor !== '#EF4444') {
      overallStatusColor = '#F59E0B';
    }
  });

  return (
    <div className="p-4 sm:p-5 rounded-2xl text-on-surface flex flex-col items-center w-full max-w-sm mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-black/5 dark:border-teal-500/25 shadow-glass-lg border-l-4 border-l-teal-600 dark:border-l-teal-400 transition-all">
      <div className="w-full flex justify-between items-start mb-3">
        <div className="pr-2 min-w-0 flex-1">
          <h4 className="text-sm sm:text-base font-bold text-primary-900 dark:text-white truncate">{exercise.name}</h4>
          <p className="text-xs text-on-surface-variant line-clamp-1">{exercise.description}</p>
        </div>
        <div
          className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
          style={{ backgroundColor: `${overallStatusColor}15`, color: overallStatusColor }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: overallStatusColor }} />
          {progress >= 0.85 ? 'Rango Óptimo' : 'En Ejecución'}
        </div>
      </div>

      {/* Dynamic movement indicator bar */}
      <div className="w-full mb-3">
        <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant mb-1">
          <span>Ciclo Biomecánico</span>
          <span className="text-teal-600 dark:text-teal-400 font-mono">{Math.round(progress * 100)}% ROM</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-75 rounded-full"
            style={{ width: `${Math.max(5, progress * 100)}%` }}
          />
        </div>
      </div>

      <div className="flex bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl w-full mb-3" aria-label="Seleccionar personaje">
        <button
          type="button"
          onClick={() => setSelectedRole('patient')}
          aria-pressed={selectedRole === 'patient'}
          className={`flex-1 px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs font-bold ${
            selectedRole === 'patient'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <User size={14} />
          Niño
        </button>
        <button
          type="button"
          onClick={() => setSelectedRole('physio')}
          aria-pressed={selectedRole === 'physio'}
          className={`flex-1 px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs font-bold ${
            selectedRole === 'physio'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Stethoscope size={14} />
          Fisioterapeuta
        </button>
      </div>

      <div className="w-full h-[min(60vw,20rem)] min-h-[16rem] sm:h-80 relative bg-slate-50 dark:bg-slate-950/60 rounded-xl p-2 sm:p-3 border border-outline/10 flex items-center justify-center overflow-hidden">
        {selectedRole === 'patient' ? (
          <KidModel3D
            key={`${exercise.id}-niño-3d`}
            jointAngles={currentJointAngles}
            jointAxes={jointAxes}
            position={exercise.position ?? 'pie'}
            statusColor={overallStatusColor}
            className="w-full h-full min-h-0"
          />
        ) : (
          <PhysioModel3D
            key={`${exercise.id}-fisio-3d`}
            jointAngles={currentJointAngles}
            jointAxes={jointAxes}
            position={exercise.position ?? 'pie'}
            statusColor={overallStatusColor}
            className="w-full h-full min-h-0"
          />
        )}
      </div>

      <div className="w-full mt-3 space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-100/70 dark:bg-slate-800/70 p-2.5 rounded-xl border border-outline/10">
          {exercise.targetJoints.map((j) => (
            <div key={j.joint} className="flex justify-between items-center">
              <span className="text-on-surface-variant capitalize text-[11px] truncate pr-1">
                {j.joint.replace('_', ' ')}:
              </span>
              <span className="font-mono font-bold text-teal-600 dark:text-teal-400 text-xs shrink-0">
                {Math.round(currentJointAngles[j.joint] ?? 0)}° / {j.targetAngle}°
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[11px] text-on-surface-variant px-1 pt-1 border-t border-outline/10">
          <span>
            Series: <strong className="text-on-surface">{exercise.sets}</strong>
          </span>
          <span>
            Repeticiones: <strong className="text-on-surface">{exercise.reps}</strong>
          </span>
          <span>
            Sostener: <strong className="text-on-surface">{exercise.holdDurationSec}s</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
