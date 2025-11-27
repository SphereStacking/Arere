/**
 * Test action with category
 */

export default {
  name: 'categorized-action',
  description: 'An action with category',
  category: 'test-category',
  async run() {
    console.log('Categorized action ran')
  },
}
