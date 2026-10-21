package com.prestamos.services;

import com.prestamos.dto.ClienteDTO;
import com.prestamos.entities.Cliente;
import com.prestamos.repositories.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Transactional(readOnly = true)
    public List<ClienteDTO> listarTodos() {
        return clienteRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<Cliente> buscarPorDni(String dni) {
        return clienteRepository.findByDni(dni);
    }

    @Transactional(readOnly = true)
    public Optional<Cliente> buscarPorId(Long id) {
        return clienteRepository.findById(id);
    }

    @Transactional
    public Cliente guardarOActualizar(Cliente cliente) {
        return clienteRepository.findByDni(cliente.getDni())
                .map(existente -> {
                    existente.setNombreCompleto(cliente.getNombreCompleto());
                    if (cliente.getTelefono() != null) existente.setTelefono(cliente.getTelefono());
                    if (cliente.getDireccion() != null) existente.setDireccion(cliente.getDireccion());
                    if (cliente.getEmail() != null) existente.setEmail(cliente.getEmail());
                    return clienteRepository.save(existente);
                })
                .orElseGet(() -> clienteRepository.save(cliente));
    }

    private ClienteDTO mapToDTO(Cliente c) {
        return ClienteDTO.builder()
                .id(c.getId())
                .dni(c.getDni())
                .nombreCompleto(c.getNombreCompleto())
                .telefono(c.getTelefono())
                .direccion(c.getDireccion())
                .email(c.getEmail())
                .fechaRegistro(c.getFechaRegistro())
                .cantidadPrestamos(c.getPrestamos() != null ? c.getPrestamos().size() : 0)
                .build();
    }
}
