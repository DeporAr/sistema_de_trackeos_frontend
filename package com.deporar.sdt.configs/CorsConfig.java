package com.deporar.sdt.configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Permitir solicitudes desde localhost:3000
        config.addAllowedOrigin("http://localhost:3000");

        // Permitir todos los métodos HTTP
        config.addAllowedMethod("*");

        // Permitir todos los headers
        config.addAllowedHeader("*");

        // Permitir credenciales
        config.setAllowCredentials(true);

        // Exponer headers específicos
        config.addExposedHeader("Authorization");
        config.addExposedHeader("Access-Control-Allow-Origin");
        config.addExposedHeader("Access-Control-Allow-Credentials");

        // Configurar el tiempo de caché para las solicitudes preflight
        config.setMaxAge(3600L);

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
