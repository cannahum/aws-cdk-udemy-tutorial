import React, { useEffect, useState } from "react";
import axios from "axios";
import { Carousel, Row, Col, Dropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  const baseUri: string = process.env.REACT_APP_API_URL!;

  const [allPhotos, setAllPhotos] = useState([]);
  const [currentPhoto, setCurrentPhoto] = useState("");

  async function fetchPhotos() {
    const { data } = await axios.get(`${baseUri}getAllPhotos`);
    console.log(data);
    setAllPhotos(data);
  }

  useEffect(() => {
    fetchPhotos();
  }, []);

  function getCarouselImage(photo: any) {
    return (
      <Carousel.Item interval={1000} style={{ height: 350 }}>
        <img src={photo.url} alt={photo.filename} className="h-100" />
        <Carousel.Caption>
          <h3 style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
            {photo.filename}
          </h3>
        </Carousel.Caption>
      </Carousel.Item>
    );
  }

  function getSingleImage(name: string) {
    const photo: any = allPhotos.find((p: any) => p.filename === name);
    return <img src={photo.url} alt={photo.filename} className="h-100" />;
  }

  function onDropdownChange(eventKey: any, event: Object) {
    setCurrentPhoto(eventKey);
  }

  return (
    <div className="App bg-secondary min-vh-100">
      <h1 className="display-3 p-3 mb-5">Super Mario & Friends</h1>
      <Row>
        <Col>
          <Carousel>{allPhotos.map(getCarouselImage)}</Carousel>
        </Col>
        <Col>
          <Dropdown onSelect={onDropdownChange}>
            <Dropdown.Toggle id="dropdown-basic">
              {currentPhoto === "" ? "Choose a Character" : currentPhoto}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {allPhotos.map((photo) => {
                return <Dropdown.Item eventKey={(photo as any).filename}>{(photo as any).filename}</Dropdown.Item>;
              })}
            </Dropdown.Menu>
          </Dropdown>
          {currentPhoto !== "" && getSingleImage(currentPhoto)}
        </Col>
      </Row>
    </div>
  );
}

export default App;
