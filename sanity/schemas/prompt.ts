import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'prompt',
  title: 'Daily Prompt',
  type: 'document',
  fields: [
    defineField({
      name: 'prompt_id',
      title: 'Prompt ID',
      type: 'string',
      validation: (Rule) => Rule.required().unique()
    }),
    defineField({
      name: 'prompt_text',
      title: 'Prompt Text',
      type: 'text',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'date',
      title: 'Display Date',
      type: 'date',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Relationship', value: 'relationship'},
          {title: 'Communication', value: 'communication'},
          {title: 'Intimacy', value: 'intimacy'},
          {title: 'Goals', value: 'goals'},
          {title: 'Daily', value: 'daily'}
        ]
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true
    })
  ],
  preview: {
    select: {
      title: 'prompt_text',
      subtitle: 'category',
      date: 'date'
    },
    prepare({title, subtitle, date}) {
      return {
        title,
        subtitle: `${subtitle} - ${date}`
      }
    }
  }
}) 