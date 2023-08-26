import React, { useState, useEffect } from 'react';

function Greeting() {
  const [timeOfDay, setTimeOfDay] = useState('');

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 0 && currentHour < 12) {
      setTimeOfDay('morning');
    } else if (currentHour >= 12 && currentHour < 18) {
      setTimeOfDay('afternoon');
    } else {
      setTimeOfDay('evening');
    }
  }, []);

  return (
    <div>
      {timeOfDay === 'morning' && <h1>Good Morning!</h1>}
      {timeOfDay === 'afternoon' && <h1>Good Afternoon!</h1>}
      {timeOfDay === 'evening' && <h1>Good Evening!</h1>}
    </div>
  );
}

export default Greeting;
