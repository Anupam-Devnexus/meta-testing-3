import React from 'react'

const Proflie = () => {
  const data = JSON.parse(localStorage.getItem('UserDetails'))

  console.log(data)
  return (
    <div>
      {data.name} <br />
      {data.email} <br />
      {data.role}
    </div>
  )
}

export default Proflie