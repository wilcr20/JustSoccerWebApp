import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { PlayersService } from '../services/players.service';
import { PositionTableService } from '../services/position-table.service';
import { AngularFireStorage } from '@angular/fire/storage';

import {finalize} from 'rxjs/operators';
import {Observable} from 'rxjs/internal/Observable';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css']
})
export class PlayersComponent implements OnInit {

  constructor(private authServ:AuthService, private playerServ:PlayersService, private tableServ:PositionTableService,private storage:AngularFireStorage) { }

  //Listas de datos
  listaIntermedia:any=[];
  listaIntermediaDos:any=[];
  playerList:any=[];
  tablesList:any=[];
  playerNoInscritas:any =[];
  jugadorasEquipo:any=[];

  //Variables NgIf
  ver:boolean=true;
  inscribe:boolean=false;
  add:boolean= false;
  vacioteam:boolean=false;

  //Variables NGModel
  // name="";
  // apellido1="";
  // apellido2="";
  // nac="";
  // nacionalidad="";
  // posicion=""; peso=""; tama="";

  playerName="";
  surname1="";
  surname2="";




  // Observables
  uploadPercent:Observable<number>;
  urlImg:Observable<String>;
  urlImagen:any;

  tablaUsar:any={};
  teams:any;
  equiposTable:any =[];


  ngOnInit() {
    this.playerServ.getPlayers().snapshotChanges()  // Obtiene todas la info de Players de DB
    .subscribe(
      Player =>{
        this.playerList=[]; // Resetea arreglo
        this.listaIntermedia=[];
        this.listaIntermedia.push(Player);
        for(var i=0; i<this.listaIntermedia[0].length;i++){
          let noteI={
             key: this.listaIntermedia[0][i].key,
             data:this.listaIntermedia[0][i].payload.toJSON()
          }

          this.playerList.push(noteI);
        }
        //this.verJugadoras();
        this.obtieneNoInscritas();
      }
    )
    this.tableServ.getPositionTable().snapshotChanges()  // Obtiene todas la info de Tablas Posiciones de DB
    .subscribe(
      Tables =>{
        this.tablesList=[]; // Resetea arreglo
        this.listaIntermediaDos=[];
        this.listaIntermediaDos.push(Tables);
        for(var i=0; i<this.listaIntermediaDos[0].length;i++){
          let noteI={
             key: this.listaIntermediaDos[0][i].key,
             data:this.listaIntermediaDos[0][i].payload.toJSON()
          }
          this.tablesList.push(noteI);
        }
       this.tablaUsar = this.tablesList.pop();
       this.obtieneEquiposTabla();
      }
    )
  }

  verJugadoras(){
    this.vacioteam= false;
    this.ver=true;
    this.inscribe=false;
    this.add=false;
  }
  addPlayer(){
    this.vacioteam= false;
    this.ver=false;
    this.inscribe=false;
    this.add=true;
  }

  inscribirPlayer(){
    this.vacioteam= false;
    this.ver=false;
    this.inscribe=true;
    this.add=false;
    this.teams = this.tablaUsar.data.teams;
  }


  // addPlayerNew(){
  //   this.urlImg.subscribe(val =>{
  //     this.urlImagen= val;
  //   let json={
  //     name:this.name,
  //     surnameI:this.apellido1,
  //     surnameII:this.apellido2,
  //     birth:this.nac,
  //     position:this.posicion,
  //     country:this.nacionalidad,
  //     weigh:this.peso,
  //     heigh:this.tama,
  //     estado:"No Inscrita",
  //     idTeam:"NULL",
  //     url:this.urlImagen
  //   }

  //   console.log("", json);
  //   this.playerServ.addPlayer(json);
  //   Swal("Bien!", "Jugadora agregada Correctamente", "success");
  //   this.inscribirPlayer();
  //   this.resetForm();
  // })}

  resetForm(){
    // this.name="";
    // this.apellido1="";
    // this.apellido2="";
    // this.nac="";
    // this.posicion="";
    // this.nacionalidad="";
    // this.peso="";
    // this.tama="";
    this.playerName="";
    this.surname1="";
    this.surname2="";
  }

  upload(e){  // Metodo para realiozar la subida de la imagen a FireStore
    let file = e.target.files[0];
    let path="profiles/"+file.name;
    let ref = this.storage.ref(path);
    let task = this.storage.upload(path,file);
    this.uploadPercent= task.percentageChanges();
    task.snapshotChanges().pipe(finalize(() =>{
      this.urlImg= ref.getDownloadURL()
    }) ).subscribe();
  }

  obtieneEquiposTabla(){
    for(var i=0; i< 8;i++){   /// .length = undefiend ... en este caso, solo usar si son 8 equipos
      this.equiposTable.push(this.tablaUsar.data.teams[i]);
    }

  }

  obtieneNoInscritas(){ // Metodo que retorna jugadoras libres sin equipos.... usando de comparacion
    this.playerNoInscritas=[];  //Su atributo de estado
    for(var i=0; i<this.playerList.length;i++){   /// .length = undefiend ... en este caso, solo usar si son 8 equipos
      if(this.playerList[i].data.estado =="No Inscrita"){
        this.playerNoInscritas.push(this.playerList[i]);
      }
    }
  }

  obtieneJugadorasEquipo(selectTeam){
    this.jugadorasEquipo= [];
    let idTeam= selectTeam.target.selectedOptions[0].value
    for(var i=0;i<this.playerList.length;i++){
      if(this.playerList[i].data.idTeam == idTeam){
        this.jugadorasEquipo.push(this.playerList[i]);
      }
    }
    if(this.jugadorasEquipo.length ==0){
      this.vacioteam=true;
    }else{
      this.vacioteam= false;
    }
    console.log("lista ", this.jugadorasEquipo);
    //console.log("Entra aca", idTeam.target.selectedOptions[0].value);
  }


  inscribirPlayerNew(){
    let idT= (<HTMLInputElement>document.getElementById("team")).value;  //Obtiene el id del equipo
    this.urlImg.subscribe(val =>{
        this.urlImagen= val;
   let json={
    idTeam:idT,
    name:this.playerName,
    surnameI:this.surname1,
    surnameII:this.surname2,
    url:this.urlImagen,
    estado:"Inscrita"
  }
  this.playerServ.addPlayer(json); // agrega jugadora
  Swal("Bien!", "Jugadora agregada Correctamente", "success");
  this.resetForm();
  this.inscribirPlayer();
})
this.inscribirPlayer();
}


}
