/**
 * Test fixture: Action with tags
 */

import { defineAction } from '@/domain/action/defineAction.js'

export default defineAction({
  name: 'test-tags',
  description: 'Test action with tags',
  tags: ['test', 'example', 'dev'],
  async run({ tui }) {
    tui.output.log('Action with tags ran')
  },
})
