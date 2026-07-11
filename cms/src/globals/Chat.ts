import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access'

const baseURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'

// Reuse the swatch color picker used by Brand.
const colorField = (name: string, label: string, defaultValue: string) => ({
  name,
  type: 'text' as const,
  label,
  defaultValue,
  admin: { components: { Field: '@/fields/ColorPicker#ColorPicker' } },
})

/**
 * Chat — the support-widget's editable text + colors, so the customer can
 * customize the assistant's wording and look from the admin (no code). The
 * public widget reads these; anything blank falls back to a sensible default.
 */
export const Chat: GlobalConfig = {
  slug: 'chat',
  label: 'Chat Widget',
  versions: { drafts: true }, // edit → Save Draft → Publish (like Pages)
  access: { read: () => true, update: isAdminOrEditor },
  admin: {
    livePreview: { url: `${baseURL}/?preview=true` },
    preview: () => `${baseURL}/?preview=true`,
  },
  fields: [
    {
      type: 'collapsible',
      label: 'Text & labels',
      fields: [
        { name: 'assistantName', type: 'text', defaultValue: 'Orion Assistant' },
        { name: 'statusText', type: 'text', label: 'Status line', defaultValue: 'Online now' },
        {
          name: 'greeting',
          type: 'textarea',
          defaultValue:
            "Hi, I'm Orion — your media assistant. Ask me anything about our services, clients, or how to get started.",
        },
        {
          name: 'placeholder',
          type: 'text',
          label: 'Input placeholder',
          defaultValue: 'Ask about campaigns, services…',
        },
        {
          name: 'chips',
          type: 'array',
          label: 'Suggestion buttons',
          admin: { description: 'Quick-question chips shown under the chat.' },
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'question', type: 'text', required: true, label: 'Sends this question' },
          ],
          defaultValue: [
            { label: 'Services', question: 'What services do you offer?' },
            { label: 'Clients', question: 'Which clients have you worked with?' },
            { label: 'Get a quote', question: 'How do I get a quote?' },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Pre-chat contact form',
      fields: [
        {
          name: 'contactIntro',
          type: 'textarea',
          label: 'Intro text',
          defaultValue: 'Please introduce yourself so our team can follow up:',
        },
        {
          name: 'contactFields',
          type: 'array',
          label: 'Form fields',
          admin: {
            description:
              'Fields the visitor fills before chatting. Add/remove/reorder. ' +
              'Mark which are required. (Name + Email are recommended for follow-up.)',
          },
          fields: [
            { name: 'label', type: 'text', required: true, label: 'Field label' },
            {
              name: 'type',
              type: 'select',
              defaultValue: 'text',
              options: [
                { label: 'Text', value: 'text' },
                { label: 'Email', value: 'email' },
              ],
            },
            { name: 'required', type: 'checkbox', defaultValue: true },
          ],
          defaultValue: [
            { label: 'Name', type: 'text', required: true },
            { label: 'Email', type: 'email', required: true },
            { label: 'Company', type: 'text', required: true },
            { label: 'Job title', type: 'text', required: true },
          ],
        },
        { name: 'startButtonLabel', type: 'text', defaultValue: 'Start chat' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Colors',
      fields: [
        colorField('launcherColor', 'Chat bubble color', '#4c7cff'),
        colorField('headerAccent', 'Chat header bar color', '#4c7cff'),
        colorField('panelBg', 'Chat window background', '#0d0f24'),
        colorField('userBubbleColor', 'Your-message bubble color', '#4c7cff'),
        colorField('botBubbleColor', 'Assistant reply bubble', '#1a1f3d'),
        colorField('textColor', 'Text color', '#f5f6fb'),
        colorField('startButtonColor', 'Start-chat button color', '#4c7cff'),
        colorField('startButtonTextColor', 'Start-chat button text', '#ffffff'),
      ],
    },
    // Hidden: seeded flag so restarts don't reset customer edits.
    { name: 'seeded', type: 'checkbox', admin: { hidden: true } },
  ],
}
