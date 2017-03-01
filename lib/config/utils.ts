export let getEnv = ( key: string ) => {
  if ( !process.env[ key ] ) {
    console.warn( `a variavel ${key} não foi definida` )
    return null
  } else {
    return process.env[ key ]
  }
}
