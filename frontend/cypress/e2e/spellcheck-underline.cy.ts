describe('Spellcheck Underlining', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('[aria-label="Text editor"]').should('be.visible');
    cy.wait(1000);
  });

  it('does not underline correctly spelled words', () => {
    cy.typeInEditor('hello world');
    cy.wait(500);
    cy.get('.spelling-error').should('not.exist');
  });

  it('underlines misspelled words with a red wavy underline', () => {
    cy.typeInEditor('helo world');
    cy.wait(500);
    cy.get('.spelling-error').should('have.length', 1);
    cy.get('.spelling-error').should('contain.text', 'helo');
    cy.get('.spelling-error').should('have.css', 'text-decoration-style', 'wavy');
  });

  it('underlines multiple misspelled words independently', () => {
    cy.typeInEditor('helo wrold');
    cy.wait(500);
    cy.get('.spelling-error').should('have.length', 2);
    cy.get('.spelling-error').eq(0).should('contain.text', 'helo');
    cy.get('.spelling-error').eq(1).should('contain.text', 'wrold');
  });

  it('removes underline when misspelled word is corrected', () => {
    cy.typeInEditor('helo');
    cy.wait(500);
    cy.get('.spelling-error').should('have.length', 1);

    cy.get('[aria-label="Text editor"]').clear();
    cy.typeInEditor('hello');
    cy.wait(500);
    cy.get('.spelling-error').should('not.exist');
  });

  it('does not underline words while text is empty', () => {
    cy.get('[aria-label="Text editor"]').should('have.value', '');
    cy.get('.spelling-error').should('not.exist');
  });

  it('shows hover tooltip when hovering over a misspelled word', () => {
    cy.typeInEditor('helo world');
    cy.wait(500);
    cy.get('.spelling-error').should('have.length', 1);

    cy.hoverMisspelledWord();
    cy.getHoverTooltip().should('be.visible');
    cy.getHoverTooltip().should('contain.text', 'Suggestions');
  });

  it('hides hover tooltip when mouse leaves the misspelled word', () => {
    cy.typeInEditor('helo world');
    cy.wait(500);

    cy.hoverMisspelledWord();
    cy.getHoverTooltip().should('be.visible');

    cy.unhoverMisspelledWord();
    cy.getHoverTooltip().should('not.exist');
  });

  it('hover tooltip displays correction suggestions', () => {
    cy.typeInEditor('helo world');
    cy.wait(500);

    cy.hoverMisspelledWord();
    cy.getHoverTooltip().should('be.visible');
    cy.getHoverTooltip().within(() => {
      cy.contains('hello').should('exist');
    });
  });

  it('clicking a suggestion in hover tooltip replaces the misspelled word', () => {
    cy.typeInEditor('helo world');
    cy.wait(500);

    cy.hoverMisspelledWord();
    cy.getHoverTooltip().should('be.visible');
    cy.getHoverTooltip().contains('hello').click();

    cy.get('[aria-label="Text editor"]').should('have.value', 'hello world');
    cy.get('.spelling-error').should('not.exist');
  });
});
