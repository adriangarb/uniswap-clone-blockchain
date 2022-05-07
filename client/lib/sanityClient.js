import sanityClient from '@sanity/client'
export const client = sanityClient({
    projectId: 'lz7mby9u',
    dataset: 'production',
    apiVersion: 'v1', // use current UTC date - see "specifying API version"!
    token:
     'sk7FKQfAIimXgwJBvOBMO1Styswj21Rc1mO9stIIlzunYKJxqxm4zBokY3qdGZvqrrhD9gW3x0OPlemGQtWtbnOjiJI1C8Sxnt8tDgfMJAVXekGfuQUqfIDuLcNTvw1NqxGAaa80NJVqdvPHbX6mqooGuAYlmStGcU0IPA6m9hLdAhyb6tX9', // or leave blank for unauthenticated usage
    useCdn: false, 
  })