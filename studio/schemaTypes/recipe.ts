import {defineField, defineType} from 'sanity'
import {
  categories,
  cuisines,
  difficulties,
  occasions,
  proteins,
  tags,
  themes,
} from '../../src/recipes/types'
import {IngredientListInput} from '../components/IngredientListInput'

// A recipe in Sanity. The Studio makes the form from this.
// The field names are the same as in the Recipe interface in src/recipes/types.ts,
// so the site's toRecipe can read what comes from Sanity.
//
// Only the title (and the slug) are required: errors, red, can't publish without them.
// Everything the Datasjekk (src/recipes/completeness.ts) asks for is a warning instead:
// yellow, "Mangler …", but a half-done recipe can still be published.
export const recipe = defineType({
  name: 'recipe', // the document type in the data: _type == "recipe"
  title: 'Oppskrift', // what the Studio calls it
  type: 'document',
  // Tabs at the top of the form. They only change how the form looks, not the data.
  // default: true = the form opens on this tab (quick posting from the phone).
  groups: [
    {name: 'raskt', title: 'Raskt', default: true},
    {name: 'detaljer', title: 'Detaljer'},
    {name: 'ingredienser', title: 'Ingredienser'},
    {name: 'fremgangsmate', title: 'Fremgangsmåte'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Tittel',
      type: 'string',
      group: 'raskt',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Adresse (slug)',
      type: 'slug',
      group: 'raskt',
      description: 'Brukes i adressen: /oppskrifter/<slug>. Ikke endre etter publisering.',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Bilde',
      type: 'image',
      group: 'raskt',
      description:
        'Klikk på bildet etterpå og velg det viktigste (hotspot), så det blir med når bildet beskjæres.',
      options: {hotspot: true},
      validation: (rule) => rule.required().warning('Mangler bilde'),
    }),
    defineField({
      name: 'description',
      title: 'Beskrivelse',
      type: 'text',
      group: 'detaljer',
      rows: 3,
      validation: (rule) => rule.required().warning('Mangler beskrivelse'),
    }),

    // --- The fixed lists, from src/recipes/types.ts ---
    defineField({
      name: 'category',
      title: 'Måltid',
      type: 'string',
      group: 'detaljer',
      options: {list: [...categories]},
      validation: (rule) => rule.required().warning('Mangler måltid'),
    }),
    defineField({
      name: 'protein',
      title: 'Hovedingrediens',
      type: 'string',
      group: 'detaljer',
      options: {list: [...proteins]},
      // The same rule as the Datasjekk: desserts, baking and side dishes often don't have one,
      // so it's only asked for on breakfast, lunch, dinner, or when the meal isn't chosen yet.
      validation: (rule) =>
        rule
          .custom((value, context) => {
            const category = context.document?.category
            const needsProtein =
              category === undefined || ['Frokost', 'Lunsj', 'Middag'].includes(String(category))
            return value || !needsProtein ? true : 'Mangler hovedingrediens'
          })
          .warning(),
    }),
    defineField({
      name: 'cuisine',
      title: 'Kjøkken',
      type: 'string',
      group: 'detaljer',
      options: {list: [...cuisines]},
      validation: (rule) => rule.required().warning('Mangler kjøkken'),
    }),
    defineField({
      name: 'difficulty',
      title: 'Vanskelighetsgrad',
      type: 'string',
      group: 'detaljer',
      options: {list: [...difficulties], layout: 'radio', direction: 'horizontal'},
      validation: (rule) => rule.required().warning('Mangler vanskelighetsgrad'),
    }),
    // An array of strings with options.list: checkboxes, several can be chosen
    defineField({
      name: 'tags',
      title: 'Tilpasninger',
      type: 'array',
      group: 'detaljer',
      of: [{type: 'string'}],
      options: {list: [...tags]},
    }),
    defineField({
      name: 'themes',
      title: 'Passer til',
      type: 'array',
      group: 'detaljer',
      of: [{type: 'string'}],
      options: {list: [...themes]},
      validation: (rule) => rule.required().warning('Mangler «Passer til»'),
    }),
    defineField({
      name: 'occasions',
      title: 'Ukedag / Helgemat',
      type: 'array',
      group: 'detaljer',
      of: [{type: 'string'}],
      description: 'Når middagen passer. Tomt = ukedag.',
      options: {list: [...occasions]},
      // Only dinners have it (the same rule as data.test.ts), so it's hidden for other meals
      hidden: ({document}) => document?.category !== undefined && document.category !== 'Middag',
    }),

    // --- Amounts and time ---
    defineField({
      name: 'servings',
      title: 'Porsjoner',
      type: 'number',
      group: ['detaljer', 'ingredienser'],
      description: 'Hvor mange porsjoner mengdene er for.',
      placeholder: 'f.eks. 4',
      validation: (rule) => [
        rule.required().warning('Mangler porsjoner'),
        rule.integer().positive(),
      ],
    }),
    defineField({
      name: 'minutes',
      title: 'Tid (minutter)',
      type: 'number',
      group: 'detaljer',
      description: 'Total tid. 30 eller mindre teller som «Rask».',
      placeholder: 'f.eks. 30',
      validation: (rule) => [rule.required().warning('Mangler tid'), rule.integer().positive()],
    }),

    // --- The recipe itself ---
    defineField({
      name: 'ingredients',
      title: 'Ingredienser',
      type: 'array',
      group: 'ingredienser',
      of: [{type: 'ingredient'}], // the object type in ingredient.ts
      components: {input: IngredientListInput}, // Sanity's list + «Lim inn liste»
      validation: (rule) =>
        rule.min(1).warning('Mangler ingredienser (oppskriften vises som «Uferdig»)'),
    }),
    defineField({
      name: 'steps',
      title: 'Fremgangsmåte',
      type: 'array',
      group: 'fremgangsmate',
      description: 'Ett steg per felt. Ikke alle oppskrifter trenger steg.',
      of: [{type: 'text', rows: 2}],
    }),
    defineField({
      name: 'tips',
      title: 'Tips',
      type: 'text',
      group: 'fremgangsmate',
      rows: 3,
    }),
    defineField({
      name: 'source',
      title: 'Kilde',
      type: 'string',
      group: 'detaljer',
      description: '«Mormor», en kokebok, en nettadresse …',
    }),
  ],
  // How a recipe looks in the list in the Studio: title, meal type and the photo
  preview: {
    select: {title: 'title', subtitle: 'category', media: 'image'},
  },
})
