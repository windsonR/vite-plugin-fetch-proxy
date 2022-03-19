import {ViteDevServer, Plugin} from 'vite'
import fetch, {Headers} from 'node-fetch'
import https from 'https'

export type ProxyOption = {
  target: string,
  secure?: boolean,
  rewrite?: (path:string)=>string
}
export default (proxyOptions: Record<string, ProxyOption>): Plugin => {

  return {
    name: 'vite-plugin-fetch-proxy',
    configureServer(server: ViteDevServer) {
      Object.keys(proxyOptions).forEach((key) => {
        const {target,secure=true,rewrite=path=>path} = proxyOptions[key]
        server.middlewares.use(key, async (req, res, next) => {
          const agent = new https.Agent({
            rejectUnauthorized: secure,
          })
          let url = req.url!
          if (rewrite) {
            url = rewrite(url)
          }
          const method = req.method!
          const headers = new Headers()
          Object.keys(req.headers).forEach(key=>{
            const value = req.headers[key]
            // @ts-ignore
            headers.set(key, value)
          })
          req.on('data', async chunk => {
            // @ts-ignore
            const response = await fetch(`${target}${url}`,{
              agent,
              method,
              headers,
              body: chunk,
            });
            const body = await response.text()
            response.headers.forEach((value, key) => {
              res.setHeader(key, value)
            })
            res.end(body)
          })
        })
      })
    },
  }
}
