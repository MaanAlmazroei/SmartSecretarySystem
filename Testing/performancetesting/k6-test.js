import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 10, // Number of virtual users
  duration: '5s', // Duration of the test
};

export default function () {
  // Fetch resources
  const resourcesResponse = http.get('http://localhost:5000/get_all_resources');

  // Log the response for debugging
  console.log('Resources Response:', resourcesResponse.body);

  // Check if the request was successful
  check(resourcesResponse, {
    'Resources API status is 200': (res) => res.status === 200,
  });
  
}