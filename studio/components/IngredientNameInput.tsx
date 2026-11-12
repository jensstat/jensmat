import {Autocomplete} from '@sanity/ui/autocomplete'
import {useEffect, useState} from 'react'
import {set, unset, useClient, type StringInputProps} from 'sanity'
import {cleanName} from '../../src/recipes/filter'

// Every ingredient name used so far, in every recipe (drafts too, since the Studio is logged in).
// array::unique removes names that are exactly the same.
const namesQuery = `array::unique(*[_type == "recipe"].ingredients[].name)`

// The raw names → a clean list for the suggestions: no empty names (null, ""),
// cleaned the same way as the site's filter does (cleanName: trimmed, lower case),
// each name once (a Set), and sorted the Norwegian way (æ, ø, å last).
function suggestionList(names: (string | null)[]): string[] {
  const cleaned = names
    .filter((name): name is string => typeof name === 'string')
    .map(cleanName)
    .filter((name) => name !== '')
  return [...new Set(cleaned)].sort((a, b) => a.localeCompare(b, 'nb'))
}

// The input for an ingredient's name: a text field that suggests the names already used,
// so "tomat" and "tomater" don't both happen. A new name can still be typed.
export function IngredientNameInput(props: StringInputProps) {
  const {elementProps, onChange, value} = props
  // The Studio's own connection to Sanity, logged in as you
  const client = useClient({apiVersion: '2025-02-19'})
  const [names, setNames] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch the names once, when the input is shown
  useEffect(() => {
    client
      .fetch<(string | null)[]>(namesQuery)
      .then((result) => setNames(suggestionList(result)))
      .catch(() => setNames([])) // no suggestions is fine: the field still works
      .finally(() => setLoading(false))
  }, [client])

  // Save the text in the document. An empty field removes the name (unset), like Sanity's own input.
  const save = (text: string) => onChange(text ? set(text) : unset())

  return (
    <Autocomplete
      id={elementProps.id}
      ref={elementProps.ref}
      onFocus={elementProps.onFocus}
      onBlur={elementProps.onBlur}
      readOnly={elementProps.readOnly}
      value={value ?? ''}
      options={names.map((name) => ({value: name}))}
      // Show names that contain what's typed: "tom" finds "tomat" and "cherrytomat"
      filterOption={(query, option) => option.value.includes(cleanName(query))}
      // Typing saves the text as it is (free text is allowed) ...
      onQueryChange={(query) => {
        if (query !== null) save(query)
      }}
      // ... and choosing a suggestion saves that name
      onChange={save}
      loading={loading}
      openButton
      placeholder="f.eks. løk"
    />
  )
}
