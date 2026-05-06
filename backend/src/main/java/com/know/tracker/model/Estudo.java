package com.know.tracker.model; // Mude "igor" para o nome que você usou no Initializr, se necessário

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity // Diz ao Spring que esta classe vai virar uma tabela no banco de dados
@Table(name = "estudos") // Opcional: define o nome exato da tabela
public class Estudo {

    @Id // Diz que este é o identificador único (a Chave Primária)
    @GeneratedValue(strategy = GenerationType.IDENTITY) // O banco de dados vai gerar o ID automaticamente (1, 2, 3...)
    private Long id;

    @Column(nullable = false) // Diz que a matéria não pode ficar em branco
    private String materia;

    @Column(nullable = false)
    private Integer tempo; // Tempo em minutos

    private LocalDate data; // A data em que o estudo ocorreu

    // --- Construtores ---
    public Estudo() {
    }

    public Estudo(String materia, Integer tempo, LocalDate data) {
        this.materia = materia;
        this.tempo = tempo;
        this.data = data;
    }

    // --- Getters e Setters (Para o Java conseguir ler e alterar os dados) ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMateria() {
        return materia;
    }

    public void setMateria(String materia) {
        this.materia = materia;
    }

    public Integer getTempo() {
        return tempo;
    }

    public void setTempo(Integer tempo) {
        this.tempo = tempo;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }
}