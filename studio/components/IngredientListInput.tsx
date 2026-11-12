import {Button, Card, Stack, Text, TextArea} from '@sanity/ui'
import {useState} from 'react'
import {insert, setIfMissing, type ArrayOfObjectsInputProps} from 'sanity'
import {parseIngredientList} from '../../src/recipes/parseIngredients'

// The input for the whole ingredient list: Sanity's own list (renderDefault: add, drag,
// delete, edit each line), with a box under it to paste a whole list into.
// The pasted lines are read by parseIngredientList (src/recipes/parseIngredients.ts)
// and added at the end of the list, as normal ingredient lines to check and fix by hand.
export function IngredientListInput(props: ArrayOfObjectsInputProps) {
  const [text, setText] = useState('')
  const parsed = parseIngredientList(text)

  function addLines() {
    // Every line in a Sanity list needs its own _key, and _type says which object type it is
    const items = parsed.map((ingredient) => ({
      _type: 'ingredient',
      _key: crypto.randomUUID().slice(0, 12),
      ...ingredient,
    }))
    // Patches: make the list if the recipe has none yet, then add the lines after the last one
    props.onChange([setIfMissing([]), insert(items, 'after', [-1])])
    setText('') // empty the box, so a second click can't add the same lines again
  }

  return (
    <Stack gap={3}>
      {props.renderDefault(props)}
      <Card padding={3} radius={2} border tone="transparent">
        <Stack gap={3}>
          <Text size={1} weight="medium">
            Lim inn liste
          </Text>
          <Text size={1} muted>
            Én ingrediens per linje: «2 dl melk», «Løk, finhakket». En linje som slutter med kolon
            («Til sausen:») blir gruppe for linjene under.
          </Text>
          <TextArea
            rows={4}
            value={text}
            onChange={(event) => setText(event.currentTarget.value)}
            readOnly={props.readOnly}
            placeholder={'2 dl melk\n3 egg\nsalt'}
          />
          <Button
            text={parsed.length > 0 ? `Legg til ${parsed.length} linjer` : 'Legg til linjer'}
            tone="primary"
            mode="ghost"
            disabled={parsed.length === 0 || props.readOnly}
            onClick={addLines}
          />
        </Stack>
      </Card>
    </Stack>
  )
}
