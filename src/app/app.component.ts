import { Component } from '@angular/core';
import { WebcamImage } from 'ngx-webcam';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private http: HttpClient) { }

  cloudAPI = '<gateway URL>';

  userImage = '';
  showForm = false;
  showResult = false;
  showSimilarity = false;
  fileName = '';
  responses3 = {} as any;
  s3Message = {} as any;
  passOrnot = '../assets/notOK.jpeg';
  s3Operation = 0;
  similarity = 0;

  webcamImage: WebcamImage | undefined;
 
  handleImage(webcamImage: WebcamImage) {
    this.webcamImage = webcamImage;
  }

  saveFaceToCollection() {
    this.showResult = false;
    this.showForm = true;
  }

  searchOnCollection(webcamImage: WebcamImage) {
    this.showForm = false;

    this.s3Operation = 2;

    // request paylaod to save on rekognition collection
    var requestPayload = JSON.stringify({
      'facePhoto': webcamImage.imageAsBase64,
      'operation': this.s3Operation
    });
    
    // http POST call
    this.makePost('/s3', requestPayload)
      .subscribe(data => {
        console.log(data);
        this.s3Message = data;
        this.showResult = true;

        var rekData = this.s3Message.body.rek;
        console.log(rekData);
        var rekKeys = Object.keys(this.s3Message.body.rek).length;
        var similarity_percentage = rekKeys != 0 ? rekData['Face']['Confidence'] : 0;
        this.similarity = similarity_percentage.toFixed(2);

        this.passOrnot = this.s3Message.statusCode === 200 && rekKeys != 0 && similarity_percentage > 70? '../assets/checkOK.jpeg' : '../assets/notOK.jpeg';
        this.showSimilarity = true;
      });
  }

  submit(webcamImage: WebcamImage, form:any){
    this.fileName = (form.firstName + form.lastName).replace(/ /g, '').toLowerCase();

    console.log(this.fileName + '.jpg');
    this.s3Operation = 1;

    // request paylaod to save on rekognition collection
    var requestPayload = JSON.stringify({
      'facePhoto': webcamImage.imageAsBase64,
      'fileName': this.fileName,
      'operation': this.s3Operation
    });

    // http POST call
    this.makePost('/s3', requestPayload)
      .subscribe(data => {
        console.log(data);
        this.s3Message = data;
        this.showResult = true;
        this.showSimilarity = false;

        this.passOrnot = this.s3Message.statusCode === 200 ? '../assets/checkOK.jpeg' : '../assets/notOK.jpeg';
      });

    this.showForm = false;
  }

  refrescar() {
    window.location.reload();
  }

  makePost(endpoint: String, payload: any) {
    return this.http.post(this.cloudAPI + endpoint, payload);
  }
}
