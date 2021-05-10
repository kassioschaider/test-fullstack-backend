import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cliente } from './model/cliente.component';
import { CrudClientesService } from './crud-clientes.service';
import { ValidateBrService } from 'angular-validate-br';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'crud-clientes',
  templateUrl: './crud-clientes.component.html',
  styleUrls: ['./crud-clientes.component.css']
})
export class CrudClientesComponent implements OnInit {

  formulario: FormGroup;
  clientes: Cliente[];
  idClienteSelecionadoDelete: number;
  clienteSelecionado: Cliente;
  alerta: string = '';
  showModal: any;
  showModalDelete: any;
  person: any = "/assets/person.svg";

  constructor(
    private clienteService: CrudClientesService,
    private formBuilder: FormBuilder,
    private validateBrService: ValidateBrService) { }

  ngOnInit(): void {
    this.carregamentoDosClientes();
    this.formulario = this.formBuilder.group({
      id: [null],
      inscricao: [null, [Validators.required, this.validateBrService.cnpj]],
      nome: [null, [Validators.min(3), Validators.maxLength(50), Validators.required]],
      apelido: [null, [Validators.min(3), Validators.maxLength(20), Validators.required]],
      status: [null, [Validators.required]],
      url: [null],
      emails: [null]
    });
  }

  carregamentoDosClientes() {
    this.clienteService.obterTodos().subscribe(
      dados => { this.clientes = dados })
  }

  onSubmit() {
    if (!this.formulario.value.id) {
      this.onCreate();
    } else {
      this.onUpdate();
    }
  }

  onCreate() {
    this.clienteService
      .cadastrar(this.formulario.value)
      .subscribe(resposta => {
        this.clientes.push(Object.assign({}, <Cliente>resposta));
        alert("Cliente cadastrado com sucesso!");
        this.resetarFormulario();
      }, (err: HttpErrorResponse) => {
        err.error.forEach(e => {
          this.alerta = this.alerta + e.campo + " - " + e.erro + "\n";
        })
        alert(this.alerta);
        this.alerta = '';
      });
  }

  onUpdate() {
    this.clienteService
      .atualizar(this.formulario.value)
      .subscribe(resposta => {
        this.clientes.push(Object.assign({}, <Cliente>resposta));
        this.carregamentoDosClientes();
        alert("Cliente atualizado com sucesso!");
        this.resetarFormulario();
      }, (err: HttpErrorResponse) => {
        err.error.forEach(e => {
          this.alerta = this.alerta + e.campo + " - " + e.erro + "\n";
        })
        alert(this.alerta);
        this.alerta = '';
      });
  }

  onDelete() {
    this.clienteService.excluirPorId(this.idClienteSelecionadoDelete)
      .subscribe();
    this.clientes.splice(this.idClienteSelecionadoDelete);
    alert("Cliente excluído com sucesso!");
    this.carregamentoDosClientes();
    return false;
  }

  abrirModalConfirmacaoExclusao(id: number) {
    this.idClienteSelecionadoDelete = id;
    return true;
  }

  abrirModalComClienteSelecionado(idSelecionado) {

    this.clienteService.obterPorId(idSelecionado).subscribe(
      dados => {
        this.formulario.setValue(dados);
        if(this.formulario.controls.url.value) this.person = this.formulario.controls.url.value;
      });

    return true;
  }

  resetarFormulario() {
    this.formulario.reset();
    this.person = "/assets/person.svg";
  }

  abrirModal() {
    return true;
  }

  fecharModal() {
    this.resetarFormulario();
    return false;
  }

  verificaValidTouched(campo) {
    return !this.formulario.get(campo).valid && this.formulario.get(campo).touched;
  }

}