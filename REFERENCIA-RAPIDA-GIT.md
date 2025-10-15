# 📋 REFERENCIA RÁPIDA: COMANDOS GIT PARA MÚLTIPLES REPOSITORIOS

---

## 🎯 COMANDOS MÁS USADOS

### Ver Repositorios Remotos
```bash
git remote -v
```

### Agregar Repositorio Remoto
```bash
git remote add nombre-remoto https://github.com/USUARIO/repo.git
```

### Eliminar Repositorio Remoto
```bash
git remote remove nombre-remoto
```

### Renombrar Repositorio Remoto
```bash
git remote rename nombre-viejo nombre-nuevo
```

### Cambiar URL de Repositorio Remoto
```bash
git remote set-url origin https://github.com/USUARIO/nuevo-repo.git
```

---

## 📤 HACER PUSH A MÚLTIPLES REPOSITORIOS

### Push a un remoto específico
```bash
git push origin main
git push backup main
```

### Push a todos los remotos
```bash
git push --all
```

### Configurar push automático a múltiples URLs
```bash
git remote set-url --add --push origin https://github.com/USER1/repo.git
git remote set-url --add --push origin https://github.com/USER2/repo.git
```

---

## 📥 FETCH Y PULL DESDE MÚLTIPLES REPOSITORIOS

### Fetch desde un remoto específico
```bash
git fetch origin
```

### Fetch desde todos los remotos
```bash
git fetch --all
```

### Pull desde un remoto específico
```bash
git pull origin main
```

---

## 🔄 SINCRONIZACIÓN CON FORK (UPSTREAM)

### Configurar upstream
```bash
git remote add upstream https://github.com/ORIGINAL/repo.git
```

### Actualizar desde upstream
```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

---

## 📦 GIT SUBMODULES

### Agregar submodule
```bash
git submodule add https://github.com/USER/repo.git path/to/submodule
```

### Clonar repo con submodules
```bash
git clone --recurse-submodules https://github.com/USER/repo.git
```

### Inicializar submodules existentes
```bash
git submodule init
git submodule update
```

### Actualizar submodules
```bash
git submodule update --remote
```

### Actualizar todos los submodules
```bash
git submodule update --remote --merge
```

### Remover submodule
```bash
git submodule deinit -f path/to/submodule
git rm -f path/to/submodule
rm -rf .git/modules/path/to/submodule
```

---

## 🌿 RAMAS (BRANCHES)

### Crear y cambiar a nueva rama
```bash
git checkout -b nueva-rama
```

### Cambiar de rama
```bash
git checkout nombre-rama
```

### Listar todas las ramas
```bash
git branch -a
```

### Eliminar rama local
```bash
git branch -d nombre-rama
```

### Eliminar rama remota
```bash
git push origin --delete nombre-rama
```

### Push de rama a remoto específico
```bash
git push origin nombre-rama
git push backup nombre-rama
```

---

## 🔍 INFORMACIÓN Y DIAGNÓSTICO

### Ver status
```bash
git status
```

### Ver historial
```bash
git log --oneline --graph --all
```

### Ver diferencias
```bash
git diff
```

### Ver detalles de remoto
```bash
git remote show origin
```

### Ver configuración
```bash
git config --list
```

---

## ⚠️ SOLUCIÓN DE PROBLEMAS COMUNES

### Error: remote origin already exists
```bash
git remote remove origin
git remote add origin https://github.com/USER/repo.git
```

### Error: failed to push some refs
```bash
git pull origin main --rebase
git push origin main
```

### Error: refusing to merge unrelated histories
```bash
git pull origin main --allow-unrelated-histories
```

### Deshacer último commit (mantener cambios)
```bash
git reset --soft HEAD~1
```

### Deshacer cambios locales
```bash
git checkout -- archivo.txt
```

### Limpiar archivos no tracked
```bash
git clean -fd
```

---

## 🎨 ALIASES ÚTILES

Agregar estos a tu `~/.gitconfig`:

```ini
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = log --oneline --graph --all
    remotes = remote -v
```

Uso:
```bash
git st          # en vez de git status
git co main     # en vez de git checkout main
git remotes     # en vez de git remote -v
```

---

## 🚀 WORKFLOW RECOMENDADO

### Trabajo diario
```bash
# 1. Actualizar código
git pull origin main

# 2. Crear rama para feature
git checkout -b feature/nueva-funcionalidad

# 3. Hacer cambios y commits
git add .
git commit -m "Add nueva funcionalidad"

# 4. Push a origin
git push origin feature/nueva-funcionalidad

# 5. Crear Pull Request en GitHub
# (hacerlo desde la interfaz web)

# 6. Después de merge, actualizar main
git checkout main
git pull origin main

# 7. Eliminar rama local
git branch -d feature/nueva-funcionalidad
```

### Backup a segundo repositorio
```bash
# 1. Configurar remoto de backup
git remote add backup https://github.com/USER/backup-repo.git

# 2. Push inicial
git push backup main

# 3. En el futuro, push regular
git push origin main
git push backup main
```

---

## 📊 TABLA DE COMPARACIÓN: REMOTOS VS SUBMODULES

| Característica | Múltiples Remotos | Submodules |
|----------------|-------------------|------------|
| **Uso** | Mismo código → varios destinos | Código de otro repo → dentro de este |
| **Sincronización** | Manual (push a cada remoto) | Manual (update submodule) |
| **Ideal para** | Backups, mirrors, forks | Librerías, dependencias |
| **Complejidad** | Baja | Media |
| **Comando básico** | `git remote add` | `git submodule add` |

---

## 🎯 CASOS DE USO COMUNES

### Caso 1: Backup
```bash
git remote add gitlab https://gitlab.com/USER/repo.git
git push gitlab main
```

### Caso 2: Fork con actualizaciones del original
```bash
git remote add upstream https://github.com/ORIGINAL/repo.git
git fetch upstream
git merge upstream/main
```

### Caso 3: Desarrollo y Producción
```bash
git remote add dev https://github.com/USER/repo-dev.git
git remote add prod https://github.com/USER/repo-prod.git
git push dev feature-branch
git push prod main
```

### Caso 4: Incluir librería externa
```bash
git submodule add https://github.com/USER/library.git lib/library
git commit -m "Add library submodule"
```

---

## 📞 RECURSOS

- **Documentación completa**: [COMO-AGREGAR-OTRO-REPOSITORIO.md](COMO-AGREGAR-OTRO-REPOSITORIO.md)
- **Git Docs**: https://git-scm.com/doc
- **GitHub Guides**: https://guides.github.com/

---

**Imprime esta página para tener una referencia rápida siempre a mano.**
