from .models import Paciente
from .models import Admision

class PacienteService:
    @staticmethod
    def obtener_activos():
        """Solo retorna pacientes que no han sido borrados lógicamente."""
        return Paciente.objects.filter(esta_activo=True)

    @staticmethod
    def crear_paciente(datos_validados):
        return Paciente.objects.create(**datos_validados)

    @staticmethod
    def obtener_por_id(id_paciente):
        try:
            return Paciente.objects.get(id_paciente=id_paciente, esta_activo=True)
        except Paciente.DoesNotExist:
            return None

    @staticmethod
    def actualizar_paciente(paciente, datos_validados):
        for campo, valor in datos_validados.items():
            setattr(paciente, campo, valor)
        paciente.save()
        return paciente

    @staticmethod
    def baja_logica(paciente):
        """Realiza la baja lógica del paciente y sus dependencias."""
        paciente.esta_activo = False
        paciente.save()
        return True
    
    @staticmethod
    def reactivar_paciente(id_paciente):
        """Reactiva un paciente que estaba dado de baja lógica."""
        try:
            paciente = Paciente.objects.get(id_paciente=id_paciente, esta_activo=False)
            paciente.esta_activo = True
            paciente.save()
            return paciente
        except Paciente.DoesNotExist:
            return None
        
class AdmisionService:
    @staticmethod
    def obtener_activas():
        """Retorna todas las admisiones que no han sido dadas de baja."""
        return Admision.objects.filter(esta_activo=True)

    @staticmethod
    def crear_admision(datos_validados):
        """Crea un nuevo episodio clínico (Admisión)."""
        return Admision.objects.create(**datos_validados)

    @staticmethod
    def obtener_por_id(pk):
        """Busca una admisión activa por su Primary Key (ID o numero_episodio)."""
        try:
            # Reemplaza 'pk' por tu campo ID real si no se llama id (ej. numero_episodio=pk)
            return Admision.objects.get(pk=pk, esta_activo=True)
        except Admision.DoesNotExist:
            return None

    @staticmethod
    def actualizar_admision(admision, datos_validados):
        """Actualiza la admisión."""
        for campo, valor in datos_validados.items():
            setattr(admision, campo, valor)
        admision.save()
        return admision

    @staticmethod
    def baja_logica(admision):
        """Desactiva la admisión sin borrarla físicamente."""
        admision.esta_activo = False
        admision.save()
        return True
    
    @staticmethod
    def reactivar_admision(pk):
        """Reactiva una admisión inactiva."""
        try:
            admision = Admision.objects.get(pk=pk, esta_activo=False)
            admision.esta_activo = True
            admision.save()
            return admision
        except Admision.DoesNotExist:
            return None