import React from 'react'

const Proflie = () => {
  const data = JSON.parse(localStorage.getItem('UserDetails'))

  return (
    <div>
      {data.name} <br />
      {data.email} <br />
      {data.role}
    </div>
  )
}

export default Proflie