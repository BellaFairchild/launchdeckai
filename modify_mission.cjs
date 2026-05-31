const fs = require('fs');

// ==== 1. EXTRACT FROM DeckScreen.tsx ====
const deckFile = 'src/components/DeckScreen.tsx';
let deckData = fs.readFileSync(deckFile, 'utf8');

const sectionStart = `      {/* ---------------- NEW MISSION MILESTONES SECTION ---------------- */}`;
const sectionEndStr = `        </div>\n      </div>\n\n`;

const startIndex = deckData.indexOf(sectionStart);
let endIndex = deckData.indexOf(sectionEndStr, startIndex);
if (endIndex !== -1) {
    endIndex += sectionEndStr.length;
}

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find boundaries in DeckScreen.tsx", startIndex, endIndex);
  process.exit(1);
}

// Remove from deck
const sectionContentRaw = deckData.substring(startIndex, endIndex);

let newDeckData = deckData.substring(0, startIndex) + deckData.substring(endIndex);

// Also remove `const [milestonesView, setMilestonesView] = useState<'list' | 'calendar'>('list');` from DeckScreen.tsx
newDeckData = newDeckData.replace(/  const \[milestonesView, setMilestonesView\] = useState<'list' | 'calendar'>\('list'\);\n/g, '');

fs.writeFileSync(deckFile, newDeckData, 'utf8');
console.log("Successfully removed from DeckScreen.tsx");

// ==== 2. PREPARE ADDITIONS FOR MissionScreen.tsx ====
const missionFile = 'src/components/MissionScreen.tsx';
let missionData = fs.readFileSync(missionFile, 'utf8');

// I need to add state and icons to MissionScreen.tsx
missionData = missionData.replace(
  /import \{ CheckCircle2, Sparkles, Square, Lock, Calendar, Rocket, Minus \} from 'lucide-react';/,
  `import { CheckCircle2, Sparkles, Square, Lock, Calendar, Rocket, Minus, Compass, Info, CalendarDays, List, TrendingUp } from 'lucide-react';`
);

missionData = missionData.replace(
  /import \{ MOCK_MISSION, MOCK_MILESTONES \} from '\.\.\/types';/,
  `import { MOCK_MISSION, MOCK_MILESTONES, MOCK_TASKS } from '../types';`
);

let snippetToInsert = `
  const [tasks, setTasks] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('subspace_cached_tasks');
      return saved ? JSON.parse(saved) : MOCK_TASKS;
    }
    return MOCK_TASKS;
  });

  useEffect(() => {
    localStorage.setItem('subspace_cached_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedTasks = localStorage.getItem('subspace_cached_tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [milestonesView, setMilestonesView] = useState<'list' | 'calendar'>('list');

  const handleToggleTask = (id: string) => {
    const updated = tasks.map(t => {
      if(t.id === id) {
        const nextCompleted = t.status !== 'completed';
        return {
          ...t,
          status: nextCompleted ? 'completed' : 'active',
          date: nextCompleted ? 'Today' : undefined
        };
      }
      return t;
    });
    setTasks(updated);
    const matchAfter = updated.find(t => t.id === id);
    if (matchAfter?.status === 'completed') {
      playSuccessSound();
      addToast('Task Completed', \`Protocol executed: \${matchAfter.title}.\`);
    } else {
      playToggleSound(false);
    }
  };

  const timelineSteps = [
    { id: 'step_1', type: 'milestone', refId: 'ms_1', dayLabel: 'T-28', title: 'Name your app', category: 'Foundation', description: 'Establish the core app identity. Choose a memorable, distinct, and clear platform title.' },
    { id: 'step_2', type: 'milestone', refId: 'ms_2', dayLabel: 'T-25', title: 'Write one-liner', category: 'Foundation', description: 'Distill your value proposition into a single high-conversion description statement.' },
    { id: 'step_3', type: 'task', refId: 't_1', dayLabel: 'T-14', title: 'Upload logo draft', category: 'Assets', description: 'Publish initial branding parameters. Vector logos help solidify system visibility.' },
    { id: 'step_4', type: 'milestone', refId: 'ms_3', dayLabel: 'T-10', title: 'Store screenshots', category: 'Assets', description: 'Upload device frames capturing pristine layouts. Visual assets convey standard utilities.' },
    { id: 'step_5', type: 'task', refId: 't_2', dayLabel: 'T-5', title: 'Storefront text', category: 'Store', description: 'Finalize targeted search-tag-ready storefront bios for deep organic user aquisition.' },
    { id: 'step_6', type: 'milestone', refId: 'ms_4', dayLabel: 'T-2', title: 'Video promo script', category: 'Marketing', description: 'Create interactive scripts matching standard media formats to hook external users.' },
    { id: 'step_7', type: 'task', refId: 't_3', dayLabel: 'T-1', title: 'Social media campaign', category: 'Marketing', description: 'Stage launch announcement blast clusters to drive immediate day-one orbital traffic.' },
    { id: 'step_8', type: 'milestone', refId: 'ms_5', dayLabel: 'T-0', title: 'Trigger Blastoff!', category: 'Launch', description: 'Clear all orbital limits! Successfully finalize pre-flight checklists and launch fully.' }
  ];

  const getStepStatus = (step: typeof timelineSteps[0]) => {
    if (step.type === 'milestone') {
      const match = milestones.find((m: any) => m.id === step.refId);
      return {
        completed: match?.status === 'cleared' || match?.completed,
        status: match?.status || 'scheduled',
        isLocked: match?.isLocked || false,
        requiredPlan: match?.requiredPlan || 'cadet'
      };
    } else {
      const match = tasks.find((t: any) => t.id === step.refId);
      return {
        completed: match?.status === 'completed',
        status: match?.status === 'completed' ? 'cleared' : match?.status || 'active',
        isLocked: match?.isLocked || false,
        requiredPlan: 'cadet'
      };
    }
  };

  const handleToggleStep = (stepId: string) => {
    const step = timelineSteps.find(s => s.id === stepId);
    if (!step) return;

    if (step.type === 'milestone') {
      const updated = milestones.map((m: any) => {
        if (m.id === step.refId) {
          const nextCleared = m.status !== 'cleared';
          return {
            ...m,
            status: nextCleared ? 'cleared' : 'scheduled',
            completed: nextCleared,
            date: nextCleared ? new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }) : undefined
          };
        }
        return m;
      });
      setMilestones(updated);
      const matchAfter = updated.find((m: any) => m.id === step.refId);
      if (matchAfter?.status === 'cleared') {
        playSuccessSound();
        addToast('Milestone Cleared', \`Telemetry updated: \${step.title}.\`);
      } else {
        playToggleSound(false);
      }
    } else {
      const updated = tasks.map((t: any) => {
        if (t.id === step.refId) {
          const nextCompleted = t.status !== 'completed';
          return {
            ...t,
            status: nextCompleted ? 'completed' : 'active',
            date: nextCompleted ? 'Today' : undefined
          };
        }
        return t;
      });
      setTasks(updated);
      const matchAfter = updated.find((t: any) => t.id === step.refId);
      if (matchAfter?.status === 'completed') {
        playSuccessSound();
        addToast('Task Completed', \`Protocol executed: \${step.title}.\`);
      } else {
        playToggleSound(false);
      }
    }
  };

  const upcomingIncompleteMilestones = timelineSteps
    .map((step, originalIndex) => ({ step, originalIndex }))
    .filter(({ step }) => step.type === 'milestone' && !getStepStatus(step).completed);

  const jumpToStep = (idx: number) => {
    console.log("Jumping omitted in MissionScreen", idx);
  };

`;

const declarationAnchor = `  const [milestones, setMilestones] = useState(() => {`;
const decIndex = missionData.indexOf(declarationAnchor);
missionData = missionData.substring(0, decIndex) + snippetToInsert + missionData.substring(decIndex);


// Add missing React hook
if (!missionData.includes('import React')) {
  missionData = missionData.replace(/import \{ useState \} from 'react';/, "import React, { useState, useEffect } from 'react';");
} else if (missionData.includes("import React, { useState } from 'react';")) {
  missionData = missionData.replace(/import React, \{ useState \} from 'react';/, "import React, { useState, useEffect } from 'react';");
}


// Now insert the UI section
const uiAnchor = `      {/* Milestone Timeline */}`;
const uiIndex = missionData.indexOf(uiAnchor);
if (uiIndex === -1) {
  console.log("Could not find UI anchor in MissionScreen.tsx");
  process.exit(1);
}

missionData = missionData.substring(0, uiIndex) + sectionContentRaw + "\n" + missionData.substring(uiIndex);

fs.writeFileSync(missionFile, missionData, 'utf8');
console.log("Successfully inserted to MissionScreen.tsx");
