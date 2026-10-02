/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    typeInEditor(text: string): Chainable<void>;
    clickMisspelledWord(index?: number): Chainable<void>;
    hoverMisspelledWord(index?: number): Chainable<void>;
    unhoverMisspelledWord(): Chainable<void>;
    getHoverTooltip(): Chainable<JQuery<HTMLElement>>;
    getCorrectionDialog(): Chainable<JQuery<HTMLElement>>;
  }
}

Cypress.Commands.add('typeInEditor', (text: string) => {
  cy.get('[aria-label="Text editor"]').clear().type(text, { delay: 50 });
});

Cypress.Commands.add('clickMisspelledWord', (index = 0) => {
  cy.get('.spelling-error').eq(index).then(($span) => {
    const wordText = $span.text();
    cy.get('[aria-label="Text editor"]').then(($textarea) => {
      const textarea = $textarea[0] as HTMLTextAreaElement;
      const fullText = textarea.value;
      const wordStart = fullText.indexOf(wordText);
      if (wordStart === -1) return;
      const clickPos = wordStart + Math.floor(wordText.length / 2);
      textarea.focus();
      textarea.setSelectionRange(clickPos, clickPos);
      textarea.dispatchEvent(new Event('select', { bubbles: true }));
    });
    const spanRect = $span[0].getBoundingClientRect();
    const x = spanRect.left + spanRect.width / 2;
    const y = spanRect.top + spanRect.height / 2;
    cy.get('[aria-label="Text editor"]').trigger('mouseup', {
      clientX: x,
      clientY: y,
      force: true,
      bubbles: true
    });
  });
});

Cypress.Commands.add('hoverMisspelledWord', (index = 0) => {
  cy.get('.spelling-error').eq(index).then(($span) => {
    const rect = $span[0].getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    cy.get('[aria-label="Text editor"]').trigger('mousemove', {
      clientX: x,
      clientY: y,
      force: true
    });
  });
});

Cypress.Commands.add('unhoverMisspelledWord', () => {
  cy.get('[aria-label="Text editor"]').then(($textarea) => {
    const rect = $textarea[0].getBoundingClientRect();
    cy.get('[aria-label="Text editor"]').trigger('mousemove', {
      clientX: rect.right - 5,
      clientY: rect.bottom - 5,
      force: true
    });
  });
});

Cypress.Commands.add('getHoverTooltip', () => {
  return cy.get('[data-testid="hover-tooltip"]');
});

Cypress.Commands.add('getCorrectionDialog', () => {
  return cy.get('[role="dialog"][aria-label="Correction suggestions"]');
});

export {};
