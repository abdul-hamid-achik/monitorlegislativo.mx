# Monitor Legislativo

## Descripcion

Este proyecto es un sistema de monitorieo de la actividad legislativa en mexico y utiliza AI y Tecnicas comunes de busqueda para visibilizar discusiones en el congreso y el senado

solo se escanean videos de @camaradediputadosmx y @senadomexico
## Instalacion

Para instalar asegurate de tener instalado pnpm y nodejs

```bash
pnpm install
```

Para correr el proyecto

```bash
pnpm dev
```

Para extraer y transcribir un video usando el ID de youtube y la CLI

es necesario pasar el ID del video, la fecha de la sesion, el tipo de sesion (senate o congress) y la ruta donde se guardara el archivo si no, el archivo se guardara en la carpeta hecha con `os.tmpdir()`

```bash
pnpm cli "6MNQhc1EmgA" "09 de mayo del 2023" "senate" ".tmp/6MNQhc1EmgA"
```

## Contribuciones

Las contribuciones son bienvenidas, por favor abre un issue primero para discutir los cambios que quieres hacer

## Licencia

[MIT](https://choosealicense.com/licenses/mit/)
