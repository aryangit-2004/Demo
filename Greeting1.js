function getGreeting() {
  const currentDateTime = new Date();
  const morningTime = new Date(currentDateTime).setHours(0, 0, 0, 0);
  const afternoonTime = new Date(currentDateTime).setHours(12, 0, 0, 0);
  const eveningTime = new Date(currentDateTime).setHours(17, 0, 0, 0);

  if (currentDateTime < morningTime) {
    return 'Good Night!';
  } else if (currentDateTime < afternoonTime) {
    return 'Good Morning!';
  } else if (currentDateTime < eveningTime) {
    return 'Good Afternoon!';
  } else {
    return 'Good Evening!';
  }
}

console.log(getGreeting());
