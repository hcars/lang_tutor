describe('Correction Suggestions', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('[aria-label="Text editor"]').should('be.visible');
    cy.wait(1000);
  });

  it('shows correction dialog when clicking a misspelled word', () => {
    cy.typeInEditor('helo world');
    cy.wait(500);

    cy.clickMisspelledWord();
    cy.getCorrectionDialog().should('be.visible');
  });

  it('displays the misspelled word in the correction dialog', () => {
    cy.typeInEditor('helo world');
    cy.wait(500);

    cy.clickMisspelledWord();
    cy.getCorrectionDialog().should('contain.text', 'helo');
  });

  it('lists all spelling suggestions in the dialog', () => {
    cy.typeInEditor('helo world');
    cy.wait(500);

    cy.clickMisspelledWord();
    cy.getCorrectionDialog().within(() => {
      cy.get('button').should('have.length.at.least', 1);
      cy.contains('hello').should('exist');
    });
  });

  it('replaces misspelled word when a suggestion is selected', () => {
    cy.typeInEditor('helo world');
    cy.wait(500);

    cy.clickMisspelledWord();
    cy.getCorrectionDialog().contains('hello').click();

    cy.get('[aria-label="Text editor"]').should('have.value', 'hello world');
    cy.get('.spelling-error').should('not.exist');
  });

  it('dismisses correction dialog on Escape key', () => {
    cy.typeInEditor('helo world');
    cy.wait(500);

    cy.clickMisspelledWord();
    cy.getCorrectionDialog().should('be.visible');

    cy.get('body').type('{esc}');
    cy.getCorrectionDialog().should('not.exist');
  });

  it('dismisses correction dialog when clicking outside', () => {
    cy.typeInEditor('helo world');
    cy.wait(500);

    cy.clickMisspelledWord();
    cy.getCorrectionDialog().should('be.visible');

    cy.get('#text-area').click('topLeft', { force: true });
    cy.getCorrectionDialog().should('not.exist');
  });

  it('clears selection when text is edited after correction', () => {
    cy.typeInEditor('helo');
    cy.wait(500);

    cy.clickMisspelledWord();
    cy.getCorrectionDialog().contains('hello').click();

    cy.get('[aria-label="Text editor"]').should('have.value', 'hello');
    cy.getCorrectionDialog().should('not.exist');
  });

  it('does not show correction dialog for correctly spelled words', () => {
    cy.typeInEditor('hello world');
    cy.wait(500);

    cy.get('.spelling-error').should('not.exist');
    cy.getCorrectionDialog().should('not.exist');
  });
});
