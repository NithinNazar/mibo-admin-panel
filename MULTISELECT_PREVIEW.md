# MultiSelect Component - Visual Preview

## How It Looks

### Initial State (No Selection)

```
Languages *
┌─────────────────────────────────────────────────┐
│ [+] Add language                                │
└─────────────────────────────────────────────────┘
No languages selected. Click the button above to add.
```

### After Selecting Malayalam

```
Languages *
┌─────────────────────────────────────────────────┐
│ Malayalam                                    [×]│
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ [+] Add language                                │
└─────────────────────────────────────────────────┘
```

### After Selecting Multiple Languages

```
Languages *
┌─────────────────────────────────────────────────┐
│ Malayalam                                    [×]│
│ Hindi                                        [×]│
│ English                                      [×]│
│ Tamil                                        [×]│
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ [+] Add language                                │
└─────────────────────────────────────────────────┘
```

### Dropdown Open

```
Languages *
┌─────────────────────────────────────────────────┐
│ Malayalam                                    [×]│
│ Hindi                                        [×]│
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ [+] Add language                             [▼]│
├─────────────────────────────────────────────────┤
│ English                                         │ ← Hover effect
│ Tamil                                           │
│ Telugu                                          │
│ Kannada                                         │
│ Marathi                                         │
│ Bengali                                         │
│ Gujarati                                        │
│ Punjabi                                         │
│ Odia                                            │
│ Urdu                                            │
│ Assamese                                        │
└─────────────────────────────────────────────────┘
```

## Color Scheme

### Selected Tags

- Background: Teal with 20% opacity (`bg-miboTeal/20`)
- Border: Teal with 30% opacity (`border-miboTeal/30`)
- Text: White
- Remove button (X): Gray → White on hover

### Add Button

- Background: Dark slate (`bg-slate-700`)
- Border: Slate (`border-slate-600`)
- Hover: Teal border (`hover:border-miboTeal/50`)
- Text: Light slate (`text-slate-300`)

### Dropdown

- Background: Dark slate (`bg-slate-700`)
- Border: Slate (`border-slate-600`)
- Items: Light slate text
- Hover: Teal background with 20% opacity

## Interactions

1. **Click "+ Add language"** → Dropdown opens
2. **Click outside** → Dropdown closes
3. **Click language in dropdown** → Tag appears, dropdown closes
4. **Click X on tag** → Tag removed
5. **Already selected languages** → Hidden from dropdown

## Responsive Design

- Works on mobile and desktop
- Dropdown scrolls if too many options
- Tags wrap to multiple lines if needed
- Touch-friendly button sizes

## Accessibility

- Proper labels with required indicator (\*)
- Keyboard navigation support
- Clear visual feedback
- Screen reader friendly

## Example Usage in Form

```tsx
<MultiSelect
  label="Languages"
  options={INDIAN_LANGUAGES}
  selectedValues={formData.languages}
  onChange={(languages) => setFormData({ ...formData, languages })}
  placeholder="Add language"
  required
/>
```

## Data Flow

```
User clicks "Malayalam"
       ↓
onChange([...selectedValues, "Malayalam"])
       ↓
formData.languages = ["Malayalam"]
       ↓
Tag appears in UI
       ↓
Saved to database as JSON array
```

## Summary

The MultiSelect component provides a modern, intuitive way to select multiple items from a predefined list. It's visually appealing, easy to use, and works seamlessly with the existing database structure.
