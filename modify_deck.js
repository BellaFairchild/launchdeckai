const fs = require('fs');
const file = 'src/components/DeckScreen.tsx';
let data = fs.readFileSync(file, 'utf8');

const anchorTop = "{/* Primary CTA linked to current Timeline briefing */}";
const anchorBottom = "{/* Premium Upgrade Banner */}";

// Find boundaries
const tasksStartStr = `      {/* Today's Tasks checking list */}`;
const tasksEndStr = `      </div>

      {/* Premium Upgrade Banner */}`;

const tasksStartIndex = data.indexOf(tasksStartStr);
const tasksEndIndex = data.indexOf(tasksEndStr);

if (tasksStartIndex === -1 || tasksEndIndex === -1) {
  console.log("Could not find boundaries");
  process.exit(1);
}

const textToMove = data.substring(tasksStartIndex, tasksEndIndex);

// Remove textToMove
data = data.substring(0, tasksStartIndex) + data.substring(tasksEndIndex);

// Insert anchor
const insertAnchor = `      {/* Launch Timeline Horizontal Block */}`;
const insertIndex = data.indexOf(insertAnchor);

if (insertIndex === -1) {
  console.log("Could not find insert anchor");
  process.exit(1);
}

// Modify texts
let modifiedText = textToMove;
modifiedText = modifiedText.replace(`Today's Protocol`, `Todays Milestones`);
modifiedText = modifiedText.replace(
  `<h3 className="font-display font-bold text-[14px] uppercase tracking-wider text-text-primary">Mission Milestones</h3>`, 
  `<h3 className="font-display font-bold text-[14px] uppercase tracking-wider text-text-primary">Upcoming Milestones</h3>`
);

const headerText = `      {/* ---------------- NEW MISSION MILESTONES SECTION ---------------- */}
      <h2 className="font-display font-extrabold text-[16px] text-text-primary tracking-tight mb-4 border-b border-border-default pb-2">Mission Milestones</h2>
`;

data = data.substring(0, insertIndex) + headerText + modifiedText + "\n" + data.substring(insertIndex);

fs.writeFileSync(file, data, 'utf8');
console.log("Modified file successfully.");
