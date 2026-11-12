import type {StructureResolver} from 'sanity/structure'
import {dataCheckItem} from './dataCheck'

// The left column in the Studio. Without this file, the Structure tool makes one item
// per document type ("Oppskrift"). Here we build it ourselves: all recipes first, then
// lists that are just a GROQ filter. Nothing is stored: a recipe leaves "Uferdige" by
// itself as soon as it gets an ingredient.
//
// S is the "structure builder": S.list() is a column, S.listItem() a line in it,
// and .child() is what opens to the right when you click the line.
export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('Innhold')
    .items([
      S.documentTypeListItem('recipe').title('Alle oppskrifter'),
      S.divider(),
      // The same rule as isIncomplete on the site: no ingredients yet = "Uferdig"
      S.listItem()
        .title('Uferdige')
        .child(
          S.documentList()
            .title('Uferdige')
            .schemaType('recipe')
            .apiVersion('2025-02-19')
            .filter('_type == "recipe" && (!defined(ingredients) || count(ingredients) == 0)'),
        ),
      S.listItem()
        .title('Mangler bilde')
        .child(
          S.documentList()
            .title('Mangler bilde')
            .schemaType('recipe')
            .apiVersion('2025-02-19')
            .filter('_type == "recipe" && !defined(image.asset)'),
        ),
      S.divider(),
      // Everything the site's Datasjekk checks, with counts (studio/dataCheck.ts)
      dataCheckItem(S, context),
    ])
