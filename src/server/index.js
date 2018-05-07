import path from 'path'
import express from 'express'
import React from 'react'
import cors from 'cors'
import bodyParser from 'body-parser'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import { graphqlExpress } from 'apollo-server-express'
import secrets from './client_secret'
import schema from './schema'
import fetch from 'node-fetch'
import serviceAccount from './secret-key'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://event0-portal.firebaseio.com',
})
const db = admin.firestore()

const app = express()
app.use(cors())
app.post(
  '/graphql',
  bodyParser.json(),
  async (req, res, next) => {
    req.context = {}

    if (req.get('Authorization')) {
      const token = req.get('Authorization').split(' ')[1]

      let id

      // if (token === testingSecret.token) {
      //   id = testingSecret.id
      //   req.context.debug = true
      // } else {
      const response = await fetch(
        'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + token
      )
      if (response.status !== 200) {
        res.status(401).json({ error: 'Invalid token.' })
        return
      }
      const json = await response.json()
      if (json.aud !== secrets.web.client_id || Date.now() > json.exp * 1000) {
        res
          .status(401)
          .json({ error: 'Incorrect application or expired token.' })
        return
      }
      id = json.sub
      // }

      const user = await db
        .collection('users')
        .doc(id)
        .get()
      if (!user.exists) {
        req.context.newUser = true
      }
    } else {
      // /// /////////////////// DEBUG ONLY
      // req.context.user = await mongo.Users.findOne({
      //   _id: '105342380724738854881',
      // })
      // req.context.newUser = '105342380724738854881'
      // /// //////////////////
      res.status(401).json({ error: 'Missing authorization header.' })
      return
    }

    next()
  },
  async (req, res, next) => {
    return graphqlExpress({
      context: { ...req.context, db },
      schema,
    })(req, res, next)
  }
)

if (process.env.NODE_ENV === 'development') {
  const webpack = require('webpack')
  const config = require('../../webpack.config.browser')
  const compiler = webpack(config)
  app.use(
    require('webpack-dev-middleware')(compiler, {
      publicPath: config.output.publicPath,
      stats: 'errors-only',
    })
  )
  app.use(require('webpack-hot-middleware')(compiler))
  // app.use(express.static(path.resolve('../src/browser')));
} else if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve('public')))
}

function render (html) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>event0 portal</title>
      </head>

      <body>
        <div id="app">${html}</div>
        <script src="bundle.js"></script>
      </body>
    </html>
  `
}

app.get('*', (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    try {
      const App = require('../browser/App.js').default
      let context = {}
      res.send(
        render(
          renderToString(
            <StaticRouter location={req.url} context={context}>
              <App />
            </StaticRouter>
          )
        )
      )
    } catch (e) {
      console.log(e)
    }
  } else {
    res.send(render(''))
  }
})

export const server = functions.https.onRequest(app)
if (process.env.NODE_ENV === 'development') {
  app.listen(3000, () => console.log('Listening on http://localhost:3000'))
}
