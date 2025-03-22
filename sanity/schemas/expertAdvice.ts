export default {
  name: 'expertAdvice',
  title: 'Expert Advice',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{ type: 'block' }],
      validation: Rule => Rule.required()
    },
    {
      name: 'points_required',
      title: 'Points Required to Unlock',
      type: 'number',
      validation: Rule => Rule.required().min(0)
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Communication', value: 'communication' },
          { title: 'Conflict Resolution', value: 'conflict_resolution' },
          { title: 'Emotional Intelligence', value: 'emotional_intelligence' },
          { title: 'Quality Time', value: 'quality_time' },
          { title: 'Trust Building', value: 'trust_building' }
        ]
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'expert',
      title: 'Expert',
      type: 'object',
      fields: [
        {
          name: 'name',
          title: 'Name',
          type: 'string'
        },
        {
          name: 'credentials',
          title: 'Credentials',
          type: 'string'
        },
        {
          name: 'avatar',
          title: 'Avatar',
          type: 'image'
        }
      ]
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      }
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime'
    }
  ],
  preview: {
    select: {
      title: 'title',
      points: 'points_required',
      category: 'category'
    },
    prepare(selection: { title: string; points: number; category: string }) {
      return {
        title: selection.title,
        subtitle: `${selection.points} points required - ${selection.category}`
      };
    }
  }
}; 