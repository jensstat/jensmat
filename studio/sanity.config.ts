import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

export default defineConfig({
  name: 'default',
  title: 'jensmatnettside',

  projectId: 'zkkwohhe',
  dataset: 'production',

  plugins: [structureTool({structure}), visionTool()],

  schema: {
    types: schemaTypes,
    // Extra choices on the "+" button. Choosing "Ny middag" is a decision you make,
    // so the starting value isn't a guess, and the Datasjekk still sees what's missing.
    // ...prev keeps Sanity's own "Oppskrift" (no starting values).
    templates: (prev) => [
      ...prev,
      {id: 'recipe-middag', title: 'Ny middag', schemaType: 'recipe', value: {category: 'Middag'}},
      {
        id: 'recipe-dessert',
        title: 'Ny dessert',
        schemaType: 'recipe',
        value: {category: 'Dessert'},
      },
    ],
  },
})
