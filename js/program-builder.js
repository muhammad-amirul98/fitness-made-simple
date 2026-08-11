function buildPrompt(fields){
  const name = fields.name || 'the client';
  const age = fields.age || 'Not given';
  const gender = fields.gender || 'Not given';
  const limitations = fields.limitations || 'None noted';
  const notes = fields.notes || 'None';

  return `You are an experienced personal trainer helping me draft a training program for a client of my personal training business, Fitness Made Simple SG (Singapore). I have 10+ years of hands-on training experience and will review and edit this before giving it to the client, so prioritize being specific and practical over hedging.

CLIENT DETAILS
- Name: ${name}
- Age: ${age}
- Gender: ${gender}
- Goal: ${fields.goal}
- Experience level: ${fields.experience}
- Equipment available: ${fields.equipment}
- Training frequency: ${fields.days} days/week, ${fields.duration} per session
- Program length: ${fields.length}
- Injuries / things to work around: ${limitations}
- Additional context: ${notes}

WHAT I NEED
1. A periodized program spanning ${fields.length}, broken into weeks or phases, with a brief rationale for the structure.
2. For each training day: exercise list with sets, reps, rest periods, and target RPE or %1RM where useful.
3. Clear progression guidance week to week (how to know when to add weight, reps, or difficulty).
4. If anything in the injuries/limitations needs a doctor's or physio's clearance before starting, flag it explicitly rather than programming around it silently.
5. Keep the language plain — this may go to a complete beginner, so avoid unexplained jargon.

Format it so I can copy it directly into a document for the client.`;
}

const form = document.getElementById('pb-form');
const result = document.getElementById('pb-result');
const copyBtn = document.getElementById('pb-copy');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const fields = {
    name: document.getElementById('pb-name').value.trim(),
    age: document.getElementById('pb-age').value.trim(),
    gender: document.getElementById('pb-gender').value,
    goal: document.getElementById('pb-goal').value,
    experience: document.getElementById('pb-experience').value,
    equipment: document.getElementById('pb-equipment').value,
    days: document.getElementById('pb-days').value,
    duration: document.getElementById('pb-duration').value,
    length: document.getElementById('pb-length').value,
    limitations: document.getElementById('pb-limitations').value.trim(),
    notes: document.getElementById('pb-notes').value.trim(),
  };
  result.value = buildPrompt(fields);
});

copyBtn.addEventListener('click', async () => {
  if (!result.value) return;
  try {
    await navigator.clipboard.writeText(result.value);
    const original = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => { copyBtn.textContent = original; }, 1800);
  } catch (err) {
    result.select();
  }
});
