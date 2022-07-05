const getJson = async () => {
  const json = await fetch('../content/content.json')
    .then((res) => {
      if (res.ok) {
        return res.json()
      }
      return Promise.reject(res)
    })
    .catch((reason) => {
      console.error('Failed to get JSON', reason)
      return Promise.reject(reason)
    })

  return json
}

export default getJson
