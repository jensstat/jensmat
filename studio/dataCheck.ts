import {map} from 'rxjs'
import type {StructureBuilder, StructureResolverContext} from 'sanity/structure'
import {checks, completenessReport, similarIngredientNames} from '../src/recipes/completeness'
import {recipeFields} from '../src/recipes/sanityQuery'
import {toRecipe} from '../src/recipes/toRecipe'
import type {Recipe} from '../src/recipes/types'

// The Datasjekk in the Studio: the same rules as /oppskrifter/datasjekk on the site.
// Not written again in GROQ: the recipes are fetched with the site's own fields
// (recipeFields), read with the site's own toRecipe, and checked with the site's own
// completenessReport and similarIngredientNames. Add a check in completeness.ts, and it
// shows up here too.

const apiVersion = '2025-02-19'

// Every recipe, drafts too. _id instead of the slug as the id, since a draft may not
// have a slug yet, and _id is what the Studio's lists need to find the recipe.
const query = `*[_type == "recipe"] | order(_createdAt desc) {_id, ${recipeFields}}`

function readRecipes(raws: {_id: string}[]): Recipe[] {
  return raws.flatMap((raw) => {
    const recipe = toRecipe({...raw, id: raw._id})
    return recipe ? [recipe] : [] // no title yet: the Studio's own red warning covers that
  })
}

// A normal Studio list of these recipes (click one, and it opens to the right).
// A recipe can exist as a draft ("drafts.abc"), as published ("abc"), or both,
// so both ids are asked for.
function recipeList(S: StructureBuilder, title: string, recipes: Recipe[]) {
  const ids = recipes.flatMap((recipe) => [recipe.id, `drafts.${recipe.id}`])
  return S.documentList()
    .title(title)
    .schemaType('recipe')
    .apiVersion(apiVersion)
    .filter('_id in $ids')
    .params({ids})
}

// The «Datasjekk» line in the left column. Its child is an Observable: listenQuery
// fetches the recipes and sends them again every time a recipe changes, so the
// counts update by themselves while you fill in a recipe.
export function dataCheckItem(S: StructureBuilder, context: StructureResolverContext) {
  return S.listItem()
    .id('datasjekk')
    .title('Datasjekk')
    .child(() =>
      context.documentStore
        .listenQuery(query, {}, {apiVersion, perspective: 'drafts', throttleTime: 1000})
        .pipe(
          map((raws: {_id: string}[]) => {
            const recipes = readRecipes(raws)
            const report = completenessReport(recipes)

            // One line per check: "Mangler bilde (3)"
            const missingItems = checks.map((check, index) => {
              const missing = report
                .filter((row) => row.missing.includes(check.label))
                .map((row) => row.recipe)
              const title = `Mangler ${check.label.toLowerCase()} (${missing.length})`
              return S.listItem()
                .id(`mangler-${index}`)
                .title(title)
                .child(recipeList(S, title, missing))
            })

            // "tomat / tomater": the recipes that use either name
            const pairs = similarIngredientNames(recipes)
            const similarItem = S.listItem()
              .id('like-navn')
              .title(`Like ingrediensnavn (${pairs.length})`)
              .child(
                S.list()
                  .title('Like ingrediensnavn')
                  .items(
                    pairs.map(([a, b], index) => {
                      const title = `${a.name} / ${b.name}`
                      const both = [...new Set([...a.recipes, ...b.recipes])]
                      return S.listItem()
                        .id(`par-${index}`)
                        .title(title)
                        .child(recipeList(S, title, both))
                    }),
                  ),
              )

            return S.list()
              .title('Datasjekk')
              .items([...missingItems, S.divider(), similarItem])
          }),
        ),
    )
}
