describe('Mervo smoke test', () => {
  it('loads the home page and checks title', () => {
    cy.visit('/');
    cy.contains('Mervo', { matchCase: false });
  });
});
