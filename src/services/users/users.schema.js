// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, getValidator, querySyntax } from '@feathersjs/schema'
import { ObjectIdSchema } from '@feathersjs/schema'
import { passwordHash } from '@feathersjs/authentication-local'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema
export const userSchema = {
  $id: 'User',
  type: 'object',
  additionalProperties: false,
  required: ['_id', 'email', 'role'],
  properties: {
    _id: ObjectIdSchema(),
    email: { type: 'string' },
    password: { type: 'string' },
    googleId: { type: 'string' },
    bio: { type: 'string' },
    photo: { type: 'string' },
    role: { type: 'string', enum: ['0', '1', '2', '3', '4', '5', '6'] }
  }
}
// 0 Membre   
// 1 Team USQ
// 2 Developpeur Certifié 
// 3 Graphiste Certifié 
// 4 Icy Premium MermberShip
// 5 modérateurs certifiés 
// 6 beta tester
export const userValidator = getValidator(userSchema, dataValidator)
export const userResolver = resolve({})

export const userExternalResolver = resolve({
  // The password should never be visible externally
  password: async () => undefined
})

// Schema for creating new data
export const userDataSchema = {
  $id: 'UserData',
  type: 'object',
  additionalProperties: false,
  required: ['email', 'role'],
  properties: {
    ...userSchema.properties
  }
}
export const userDataValidator = getValidator(userDataSchema, dataValidator)
export const userDataResolver = resolve({
  password: passwordHash({ strategy: 'local' }),
  photo: async (value) => {
    // Hash the photo URL before storing it
    return await hash(value)
  }
})

// Schema for updating existing data
export const userPatchSchema = {
  $id: 'UserPatch',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...userSchema.properties
  }
}
export const userPatchValidator = getValidator(userPatchSchema, dataValidator)
export const userPatchResolver = resolve({
  password: passwordHash({ strategy: 'local' }),
  photo: async (value) => {
    // Hash the photo URL before storing it
    return await hash(value)
  }
})

// Schema for allowed query properties
export const userQuerySchema = {
  $id: 'UserQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(userSchema.properties)
  }
}
export const userQueryValidator = getValidator(userQuerySchema, queryValidator)
export const userQueryResolver = resolve({
  // If there is a user (e.g. with authentication), they are only allowed to see their own data
  _id: async (value, user, context) => {
    if (context.params.user) {
      return context.params.user._id
    }

    return value
  },
  role: async (value, user, context) => {
    if (context.params.user && context.params.user.role === 'admin') {
      return value
    }

    return undefined
  }
})