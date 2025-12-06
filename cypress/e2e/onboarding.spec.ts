// Placeholder: Cypress E2E test for onboarding flow
// TODO: Install Cypress and configure cypress/support/ if not present
// This test runs through the first-run modal and guided tour

describe('Onboarding Flow', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clearLocalStorage();
  });

  it('Should display first-run modal and tour', () => {
    // TODO: Implement after FirstRunModal is integrated in app root
    // cy.contains('Welcome to Mervo').should('be.visible');
    // cy.contains('Take the tour').click();
    // cy.contains('Step 1 of').should('be.visible');
  });

  it('Should complete the guided tour', () => {
    // TODO: Complete all tour steps
    // cy.get('[data-testid="tour-next"]').click();
    // cy.get('[data-testid="tour-next"]').click();
    // cy.get('[data-testid="tour-next"]').click();
    // cy.contains('Complete').click();
    // cy.contains('Step 1 of').should('not.exist');
  });

  it('Should allow skipping the tour', () => {
    // TODO: Test skip behavior
    // cy.contains('Skip').click();
    // cy.contains('Welcome to Mervo').should('not.exist');
  });

  it('Should not show first-run modal on second visit', () => {
    // cy.visit('/');
    // cy.contains('Welcome to Mervo').should('be.visible');
    // cy.contains('Skip for now').click();
    // cy.reload();
    // cy.contains('Welcome to Mervo').should('not.exist');
  });
});
