package com.know.tracker.repository;

import com.know.tracker.model.Estudo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstudoRepository extends JpaRepository<Estudo, Long> {
    // Só de estender o JpaRepository, você já ganha de brinde os métodos:
    // save(), findAll(), findById(), deleteById(), etc.
}