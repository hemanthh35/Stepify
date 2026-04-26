/**
 * Turn a Stepify explanation payload into readable Markdown for notes or sharing.
 */
export function explanationToMarkdown(explanation) {
  if (!explanation || typeof explanation !== 'object') {
    return '';
  }
  const title = typeof explanation.title === 'string' && explanation.title.trim()
    ? explanation.title.trim()
    : 'Walkthrough';
  const lines = [`# ${title}`];

  if (typeof explanation.description === 'string' && explanation.description.trim()) {
    lines.push('');
    lines.push(explanation.description.trim());
  }

  const steps = Array.isArray(explanation.steps) ? explanation.steps : [];
  steps.forEach((step, index) => {
    const heading = typeof step.heading === 'string' && step.heading.trim()
      ? step.heading.trim()
      : `Step ${index + 1}`;
    lines.push('');
    lines.push(`## Step ${index + 1}: ${heading}`);
    if (typeof step.description === 'string' && step.description.trim()) {
      lines.push('');
      lines.push(step.description.trim());
    }
    const mainText = step.content && typeof step.content.mainText === 'string' && step.content.mainText.trim();
    if (mainText) {
      lines.push('');
      lines.push(mainText);
    }
    const interaction = step.interactionType || 'text';
    lines.push('');
    lines.push(`_Interaction: ${interaction}_`);
  });

  return lines.join('\n');
}
