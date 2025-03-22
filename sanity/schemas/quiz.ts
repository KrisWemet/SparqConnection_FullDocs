import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'quiz',
  title: 'Quiz',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Quiz Title',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text'
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Communication', value: 'communication'},
          {title: 'Empathy', value: 'empathy'},
          {title: 'Conflict Resolution', value: 'conflict_resolution'}
        ]
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'questions',
      title: 'Questions',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {
            name: 'question',
            title: 'Question',
            type: 'text',
            validation: (Rule) => Rule.required()
          },
          {
            name: 'options',
            title: 'Options',
            type: 'array',
            of: [{
              type: 'object',
              fields: [
                {
                  name: 'text',
                  title: 'Option Text',
                  type: 'string',
                  validation: (Rule) => Rule.required()
                },
                {
                  name: 'score',
                  title: 'Score',
                  type: 'number',
                  validation: (Rule) => Rule.required().min(0).max(5)
                }
              ]
            }],
            validation: (Rule) => Rule.required().min(2)
          }
        ]
      }],
      validation: (Rule) => Rule.required().min(1)
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true
    })
  ]
}) 