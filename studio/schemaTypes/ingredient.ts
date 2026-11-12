import {defineField, defineType} from 'sanity'
import {IngredientNameInput} from '../components/IngredientNameInput'

// One line in a recipe's ingredient list: "2 dl melk, romtemperert".
// The same fields as Ingredient in src/recipes/types.ts. Only the name is required:
// "salt og pepper" has no amount, "3 egg" has no unit.
// An 'object' isn't a document of its own; it only lives inside a recipe.
export const ingredient = defineType({
  name: 'ingredient',
  title: 'Ingrediens',
  type: 'object',
  fields: [
    defineField({
      name: 'amount',
      title: 'Mengde',
      type: 'number',
      validation: (rule) => rule.positive(),
    }),
    defineField({
      name: 'unit',
      title: 'Enhet',
      type: 'string',
      description: 'g, dl, ss, ts, stk … Tomt for f.eks. «3 egg».',
    }),
    defineField({
      name: 'name',
      title: 'Navn',
      type: 'string',
      description: 'Bare selve ingrediensen («løk», ikke «finhakket løk»), så filteret finner den.',
      components: {input: IngredientNameInput},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'note',
      title: 'Merknad',
      type: 'string',
      description: '«finhakket», «romtemperert» … Vises etter navnet.',
    }),
    defineField({
      name: 'group',
      title: 'Gruppe',
      type: 'string',
      description: 'Valgfritt: «Til dippen», «Saus». Like grupper vises sammen.',
    }),
  ],
  // How one line looks in the list in the Studio: "2 dl melk", with the note and group under
  preview: {
    select: {amount: 'amount', unit: 'unit', name: 'name', note: 'note', group: 'group'},
    prepare({amount, unit, name, note, group}) {
      return {
        title: [amount, unit, name].filter(Boolean).join(' ') || 'Ingrediens uten navn',
        subtitle: [note, group && `Gruppe: ${group}`].filter(Boolean).join(' · '),
      }
    },
  },
})
