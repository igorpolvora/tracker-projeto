package com.know.tracker.controller;

import com.know.tracker.model.Estudo;
import com.know.tracker.repository.EstudoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/estudos") // O endereço base da nossa API
@CrossOrigin(origins = "*") // Permite que o nosso HTML (que está em outra porta/pasta) acesse essa API sem bloqueios de segurança
public class EstudoController {

    @Autowired
    private EstudoRepository repository;

    // Rota para LISTAR todos os estudos (GET)
    @GetMapping
    public List<Estudo> listarTodos() {
        return repository.findAll();
    }

    // Rota para CRIAR um novo estudo (POST)
    @PostMapping
    public Estudo criarEstudo(@RequestBody Estudo novoEstudo) {
        return repository.save(novoEstudo);
    }

    // Rota para DELETAR um estudo (DELETE)
    @DeleteMapping("/{id}")
    public void deletarEstudo(@PathVariable Long id) {
        repository.deleteById(id);
    }
}