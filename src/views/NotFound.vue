<template>
  <div class="not-found">
    <div class="container">
      <div class="not-found-content">
        <h1>Page Not Found</h1>
        <router-link to="/">Go Back Home</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #282c34;
}

.not-found-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

h1 {
  font-size: 4rem;
  text-align: center;
  color: #fff;
}

a {
  margin-top: 2rem;
  padding: 1rem 2rem;
  background-color: #fff;
  border: 2px solid #2db77c;
  border-radius: 30px;
  text-decoration: none;
  color: #282c34;
  transition: all 0.3s ease-in-out;
}

a:hover {
  border-color: #fff;
  background-color: transparent;
  color: #2db77c;
}
</style>
