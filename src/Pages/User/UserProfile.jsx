import React from 'react'

const UserProfile = () => {

  const data = JSON.parse(localStorage.getItem('UserDetails'))

  console.log(data)

  return (
    <div>UserProfile</div>
  )
}

export default UserProfile