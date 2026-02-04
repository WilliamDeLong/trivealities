import React, { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import axios from 'axios';


function Routes() {
  const [routes, setRoutes] = useState([]);


  useEffect(() => {
    async function fetchData() {
      const result = await axios(
        //'https://api-v3.mbta.com/routes?sort=sort_order&fields%5Broute%5D=color%2Clong_name%2Ctext_color%2Cdirection_destinations&filter%5Btype%5D=1',
        //'https://api-v3.mbta.com/routes?page%5Blimit%5D=30&filter%5Btype%5D=1%2C%200%2C%202%2C%204',
        'https://api-v3.mbta.com/routes?page%5Blimit%5D=20&filter%5Btype%5D=0%2C%201%2C%202%2C%204'
      );
      setRoutes(result.data.data);
    }
    fetchData();
  }, []);


  return (
    <div>
		<Container fluid>
			<Row>
      {routes.map(routes => (
        <Card
        body
        outline
        color="success"
		bg={routes.attributes.color === 'DA291C' ? 'danger': routes.attributes.color === 'ED8B00' ? 'warning': routes.attributes.color === '003DA5' ? 'info': 'light'}
        className="mx-1 my-2"
        style={{ width: "25rem" }}
      >
        <Card.Body>
        <Card.Title>{routes.attributes.long_name}</Card.Title>
        <Card.Text>{routes.attributes.direction_destinations[0]} to {routes.attributes.direction_destinations[1]}</Card.Text>
        </Card.Body>
      </Card>
      ))}
	</Row>

        
	
	
		<Row>
			<Col></Col>
			<Col><h1>Routes!</h1></Col>
			<Col></Col>
			</Row>
		<Row>	
      {routes.map(routes => (
		<Col>
        <div key={routes.id}>
          <h3>{routes.attributes.long_name}</h3>
          <p>{routes.attributes.direction_destinations[0]} to {routes.attributes.direction_destinations[1]}</p>
        </div>
		</Col>
      ))}
	  </Row>
	</Container>
    </div>
  );
}


export default Routes;