# Émulateur architecture Von Neumann

Projet stage juillet 2021 - Arnaud Virazel

## Discussions

### Codage des instructions

<table>
  <thead>
    <tr>
      <th>COP</th>
      <th>MA</th>
      <th>RA</th>
      <th>Signification</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan=5>8 bits</td> 
      <td>x000</td>
      <td rowspan=5>20 bits</td>
      <td>Immédiat</td>
    </tr>
    <tr>
      <td>x001</td>
      <td>Direct</td>
    </tr>
    <tr>
      <td>x010</td>
      <td>Indirect</td>
    </tr>
    <tr>
      <td>x011</td>
      <td>Indexé</td>
    </tr>
    <tr>
      <td>x100</td>
      <td>Relatif</td>
    </tr>
    <tr>
      <td colspan=4>Si x = 0, mode d'adressage normal.<br /> Si x = 1, mode d'adressage étendu.</td>
    </tr>
    <tr>
      <td colspan=4>Si on met 20 bits en RA, l'utilisateur peut coder un entier jusqu'à 1M,<br /> éventuellement 500k si on met un registre de signe.</td>
    </tr>
  </tbody>
</table>

### Registres

Registres obligatoires :

* Compteur ordinal (CO)
* Registre d'échange (RE)
* Registre d'instruction (RI)
* Registre d'index (RX)
* Registre d'adresse mémoire (RAM)

Registres manipulables :

* Registres A B C D : 
  * 2 registres à manipuler (A et B) 
  * 1 ou 2 registres de stockage (C et D, à renommer pour plus de clarté)

Autre :

* Stack pointer

### Mémoire

* Quelle taille pour la mémoire ? 2^n (avec n = nombre de bits de RA) ? Ou moins ? (parce que là ça fait beaucoup) 
* Où mettre la pile ? Fin de la mémoire ? Ou adresse définie ?

### Instructions

Instruction|Registres|RA?
--|--|--
LOAD|A/B/C/D/X|oui
STORE|A/B/C/D/X|oui
INC|A/B/C/D/X|non
ADD|A/B/C/D/X|oui
CALL||oui
RETURN||non
JUMP||oui
JUMPC|conditions?|oui
NOOP||non

### Notes

Affichage du registre de flag (pour les conditions)

Affichage des valeurs in et out lorsqu'un registre est modifié

Voir comment coder SelMS (2 bits ?) adresse suivante (n bits logiquement) et condition (3 bits ?)
